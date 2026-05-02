'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { flattenError } from 'zod'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { CreatePostDto } from '../dto/create-post.dto'
import { PostService } from '../post.service'
import { CreatePostState } from '../types'

export async function createPost(state: CreatePostState, formData: FormData) {
  const result = await PostService.create(
    new CreatePostDto(Object.fromEntries(formData)),
  )
  return result.match(
    (response) => {
      revalidateTag(CACHE_TAGS.posts, {})
      redirect(ROUTES.post(response.post.id))
    },
    (error) => {
      switch (error.type) {
        case 'unauthorized':
          return redirect(ROUTES.loginWithRedirect(ROUTES.newPost))
        case 'forbidden':
          return redirect(ROUTES.home)
        case 'lexical':
        case 'entity':
          return { ...state, status: 'ERROR' } as CreatePostState
        case 'dto':
          return {
            ...state,
            error: flattenError(error.details),
            status: 'ERROR',
          } as CreatePostState
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_CREATE_POST_ERROR',
          )
          return { ...state, status: 'ERROR' } as CreatePostState
        }
      }
    },
  )
}
