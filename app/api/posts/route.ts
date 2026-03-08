import { prettifyError } from 'zod/v4/core'

import { CreatePostService, GetPostsService } from '@/features/posts/services'
import { INTERNAL_SERVER_ERROR } from '@/globals/constants'
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
        case 'zod':
          return createResponse({
            body: { type: error.type },
            message: prettifyError(error.details),
            status: error.status,
            url: request.url,
          })
        case 'query':
        case 'count': {
          return createResponse({
            body: { type: error.type },
            status: error.status,
            url: request.url,
          })
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
      switch (error.type) {
        case 'unauthorized':
        case 'forbidden':
          return createResponse({ status: error.status, url: request.url })
        case 'zod':
          return createResponse({
            body: { type: error.type },
            message: prettifyError(error.details),
            status: error.status,
            url: request.url,
          })
        case 'json':
        case 'insert': {
          return createResponse({
            body: { type: error.type },
            status: error.status,
            url: request.url,
          })
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
