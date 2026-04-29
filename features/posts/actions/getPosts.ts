'use cache'

import { logger } from '@/lib/logger'

import { FindAndCountPostsDto } from '../dto'
import { PostService } from '../post.service'

export async function getPosts(
  params: FirstConstructorParameterOf<typeof FindAndCountPostsDto>,
) {
  const dto = new FindAndCountPostsDto(params)
  const result = await PostService.findAndCount(dto)
  return result.match(
    (response) => ({
      currentPage: response.currentPage,
      error: null,
      posts: response.posts,
      totalPages: response.totalPages,
    }),
    (error) => {
      switch (error.type) {
        case 'dto':
        case 'entity': {
          return { currentPage: null, error, posts: null, totalPages: null }
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_FIND_AND_COUNT_POSTS_ERROR',
          )
          return { currentPage: null, error, posts: null, totalPages: null }
        }
      }
    },
  )
}
