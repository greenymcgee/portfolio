'use server'

import { logger } from '@/lib/logger'

import { FindPostDto } from '../dto'
import { PostService } from '../post.service'

export async function getPost(id: AuthoredPost['id']) {
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
