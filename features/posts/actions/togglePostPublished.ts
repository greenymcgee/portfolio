'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { flattenError } from 'zod'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { TogglePostPublishedDto } from '../dto/toggle-post-published.dto'
import { PostService } from '../post.service'
import type { TogglePostPublishedState } from '../types'

export async function togglePostPublished(
  _: TogglePostPublishedState,
  formData: FormData,
) {
  const params = Object.fromEntries(formData)
  const result = await PostService.togglePublished(
    new TogglePostPublishedDto(params),
  )
  return result.match(
    ({ post }) => {
      updateTag(CACHE_TAGS.post(post.id))
      if (post.publishedAt) return redirect(ROUTES.post(post.id))

      return {
        content: post.content,
        description: post.description,
        id: String(post.id),
        publishedAt: post.publishedAt,
        status: 'SUCCESS',
        title: post.title,
      } as TogglePostPublishedState
    },
    (error) => {
      switch (error.type) {
        case 'dto':
          return {
            ...params,
            dtoError: flattenError(error.details),
            errorType: error.type,
            status: 'ERROR',
          } as TogglePostPublishedState
        case 'entity':
        case 'lexical':
        case 'not-found':
          return {
            ...params,
            errorType: error.type,
            status: 'ERROR',
          } as TogglePostPublishedState
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
          } as TogglePostPublishedState
        default:
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_UPDATE_POST_ERROR',
          )
          return {
            ...params,
            errorType: 'unhandled',
            status: 'ERROR',
          } as TogglePostPublishedState
      }
    },
  )
}
