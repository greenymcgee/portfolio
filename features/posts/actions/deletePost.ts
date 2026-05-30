'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { FindPostDto } from '../dto'
import { PostService } from '../post.service'
import { DeletePostState } from '../types'

export async function deletePost(state: DeletePostState) {
  const result = await PostService.delete(new FindPostDto(state.id))
  return result.match(
    ({ id }) => {
      updateTag(CACHE_TAGS.posts)
      updateTag(CACHE_TAGS.post(id))
      redirect(ROUTES.posts)
    },
    (error) => {
      switch (error.type) {
        case 'unauthorized': {
          return redirect(ROUTES.loginWithRedirect(ROUTES.post(state.id)))
        }
        case 'forbidden':
        case 'dto':
        case 'entity':
        case 'not-found':
          return {
            ...state,
            errorType: error.type,
            status: 'ERROR',
          } satisfies DeletePostState
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_DELETE_POST_ERROR',
          )
          return {
            ...state,
            errorType: 'unhandled',
            status: 'ERROR',
          } satisfies DeletePostState
        }
      }
    },
  )
}
