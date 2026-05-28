'use cache'

import { cacheTag } from 'next/cache'
import { flattenError } from 'zod'

import { CACHE_TAGS, INTERNAL_SERVER_ERROR } from '@/globals/constants'
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
    (response) =>
      ({
        currentPage: response.currentPage,
        errorType: null,
        posts: response.posts,
        totalPages: response.totalPages,
      }) as const,
    (error) => {
      switch (error.type) {
        case 'dto':
          return {
            currentPage: null,
            error: flattenError(error.details),
            errorType: error.type,
            posts: null,
            status: error.status,
            totalPages: null,
          } as const
        case 'entity':
        case 'not-found':
          return {
            currentPage: null,
            errorType: error.type,
            posts: null,
            status: error.status,
            totalPages: null,
          } as const
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_FIND_AND_COUNT_POSTS_ERROR',
          )
          return {
            currentPage: null,
            errorType: 'unhandled',
            posts: null,
            status: INTERNAL_SERVER_ERROR,
            totalPages: null,
          } as const
        }
      }
    },
  )
}
