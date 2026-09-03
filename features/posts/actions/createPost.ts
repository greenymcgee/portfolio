'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { PostService } from '../post.service'
import { CreatePostState } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createPost(_: CreatePostState): Promise<CreatePostState> {
  const result = await PostService.create()
  return result.match(
    (response) => {
      updateTag(CACHE_TAGS.posts)
      redirect(ROUTES.editPost(response.post.id))
    },
    (error) => {
      switch (error.type) {
        case 'unauthorized':
          return redirect(ROUTES.login)
        case 'forbidden':
          return redirect(ROUTES.home)
        case 'entity':
        case 'not-found':
          return {
            errorType: error.type,
            status: 'ERROR',
          }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_CREATE_POST_ERROR',
          )
          return {
            errorType: 'unhandled',
            status: 'ERROR',
          } as CreatePostState
        }
      }
    },
  )
}
