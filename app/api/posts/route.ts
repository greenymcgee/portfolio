import { prettifyError } from 'zod/v4/core'

import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/constants'
import { CreatePostService, GetPostsService } from '@/features/posts/services'
import { createResponse } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const service = new GetPostsService(request)
  const result = await service.getPosts()
  return result.match(
    (response) => {
      return createResponse({
        body: { posts: response.posts, totalPages: response.totalPages },
        status: response.status,
        url: request.url,
      })
    },
    (error) => {
      switch (error.type) {
        case 'params':
          return createResponse({
            message: prettifyError(error.details),
            status: error.status,
            url: request.url,
          })
        case 'query':
        case 'count': {
          return createResponse({ status: error.status, url: request.url })
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_GET_POSTS_ERROR',
          )
          return createResponse({
            status: INTERNAL_SERVER_ERROR,
            url: request.url,
          })
        }
      }
    },
  )
}

export async function POST(request: Request) {
  const service = new CreatePostService(request)
  const result = await service.createPost()
  return result.match(
    (response) => {
      return createResponse({
        body: { post: response.post },
        status: response.status,
        url: request.url,
      })
    },
    (error) => {
      switch (error.status) {
        case FORBIDDEN:
        case UNAUTHORIZED:
        case BAD_REQUEST:
        case CONFLICT:
        case INTERNAL_SERVER_ERROR:
        case NOT_FOUND:
        case UNPROCESSABLE_CONTENT: {
          return createResponse({ status: error.status, url: request.url })
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_CREATE_POST_ERROR',
          )
          return createResponse({
            status: INTERNAL_SERVER_ERROR,
            url: request.url,
          })
        }
      }
    },
  )
}
