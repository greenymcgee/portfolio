'use cache'

import { cacheTag } from 'next/cache'

import { CACHE_TAGS } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { FindPostDto } from '../dto'
import { PostService } from '../post.service'

export async function getPost(id: AuthoredPost['id']) {
  cacheTag(CACHE_TAGS.post)
  const result = await PostService.findOne(new FindPostDto(id))
  return result.match(
    (response) => ({ error: null, post: response.post }),
    (error) => {
      switch (error.type) {
        case 'dto':
        case 'entity': {
          return { error, post: null }
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_FIND_POST_ERROR',
          )
          return { error, post: null }
        }
      }
    },
  )
}
