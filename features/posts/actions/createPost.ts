'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { flattenError } from 'zod'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { CreatePostDto } from '../dto/create-post.dto'
import { PostService } from '../post.service'
import { CreatePostState } from '../types'

export async function createPost(state: CreatePostState, formData: FormData) {
  const params = Object.fromEntries(formData)
  const result = await PostService.create(new CreatePostDto(params))
  return result.match(
    (response) => {
      updateTag(CACHE_TAGS.posts)
      redirect(ROUTES.post(response.post.id))
    },
    (error) => {
      switch (error.type) {
        case 'unauthorized':
          return redirect(ROUTES.loginWithRedirect(ROUTES.newPost))
        case 'forbidden':
          return redirect(ROUTES.home)
        case 'entity':
        case 'lexical':
        case 'not-found':
          return {
            ...params,
            errorType: error.type,
            status: 'ERROR',
          } as CreatePostState
        case 'dto':
          return {
            ...params,
            error: flattenError(error.details),
            errorType: error.type,
            status: 'ERROR',
          } as CreatePostState
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_CREATE_POST_ERROR',
          )
          return {
            ...params,
            errorType: 'unhandled',
            status: 'ERROR',
          } as CreatePostState
        }
      }
    },
  )
}
