'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { FindPostDto } from '../dto'
import { PostService } from '../post.service'
import { DeletePostState } from '../types'

export async function deletePost(state: DeletePostState) {
  const result = await PostService.delete(new FindPostDto(state.id))
  return result.match(
    () => {
      revalidateTag(CACHE_TAGS.posts, {})
      redirect(ROUTES.posts)
    },
    (error) => {
      switch (error.type) {
        case 'unauthorized': {
          return redirect(ROUTES.loginWithRedirect(ROUTES.post(state.id)))
        }
        case 'forbidden':
        case 'dto':
        case 'entity': {
          return { ...state, status: 'ERROR' } satisfies DeletePostState
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_DELETE_POST_ERROR',
          )
          return { ...state, status: 'ERROR' } satisfies DeletePostState
        }
      }
    },
  )
}
