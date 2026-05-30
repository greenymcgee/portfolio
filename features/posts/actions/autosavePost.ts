'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { flattenError } from 'zod'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { UpdatePostDto } from '../dto/update-post.dto'
import { PostService } from '../post.service'
import { UpdatePostState } from '../types'

export async function autosavePost(_: UpdatePostState, formData: FormData) {
  const params = Object.fromEntries(formData)
  const result = await PostService.update(new UpdatePostDto(params))
  return result.match(
    ({ post: { id } }) => {
      updateTag(CACHE_TAGS.post(id))
      return { ...params, status: 'SUCCESS' } as UpdatePostState
    },
    (error) => {
      switch (error.type) {
        case 'dto':
          return {
            ...params,
            dtoError: flattenError(error.details),
            errorType: error.type,
            status: 'ERROR',
          } as UpdatePostState
        case 'entity':
        case 'lexical':
        case 'not-found':
          return {
            ...params,
            errorType: error.type,
            status: 'ERROR',
          } as UpdatePostState
        case 'forbidden':
          return redirect(ROUTES.home)
        case 'unauthorized':
          return redirect(
            ROUTES.loginWithRedirect(ROUTES.post(Number(params.id))),
          )
        case 'unique-constraint':
          return {
            ...params,
            errorType: error.type,
            status: 'ERROR',
            threwUniqueConstraintError: true,
          } as UpdatePostState
        default:
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_UPDATE_POST_ERROR',
          )
          return {
            ...params,
            errorType: 'unhandled',
            status: 'ERROR',
          } as UpdatePostState
      }
    },
  )
}
