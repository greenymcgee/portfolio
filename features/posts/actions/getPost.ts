'use cache'

import { cacheTag } from 'next/cache'

import { CACHE_TAGS, INTERNAL_SERVER_ERROR } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { FindPostDto } from '../dto'
import { PostService } from '../post.service'

export async function getPost(id: AuthoredPost['id']) {
  cacheTag(CACHE_TAGS.post)
  const result = await PostService.findOne(new FindPostDto(id))
  return result.match(
    (response) =>
      ({
        errorType: null,
        post: response.post,
        status: response.status,
      }) as const,
    (error) => {
      switch (error.type) {
        case 'dto':
        case 'entity':
        case 'not-found':
          return {
            errorType: error.type,
            post: null,
            status: error.status,
          } as const
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_GET_POST_ERROR',
          )
          return {
            errorType: 'unhandled',
            post: null,
            status: INTERNAL_SERVER_ERROR,
          } as const
        }
      }
    },
  )
}
