'use cache'

import { cacheTag } from 'next/cache'
import { flattenError } from 'zod'

import { CACHE_TAGS } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { FindAndCountPostsDto } from '../dto'
import { PostService } from '../post.service'

export async function getPostsCache(
  params: FirstConstructorParameterOf<typeof FindAndCountPostsDto>,
) {
  cacheTag(CACHE_TAGS.posts)
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
          return {
            currentPage: null,
            error: flattenError(error.details),
            posts: null,
            totalPages: null,
          }
        case 'entity':
          return { currentPage: null, error, posts: null, totalPages: null }
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
