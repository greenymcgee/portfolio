import { FindPostDto } from '@/features/posts/dto/find-post.dto'
import { PostService } from '@/features/posts/post.service'
import { INTERNAL_SERVER_ERROR } from '@/globals/constants'
import { createResponse } from '@/lib/db'
import { logger } from '@/lib/logger'

type FindPostContext = FirstConstructorParameterOf<typeof FindPostDto>

export async function DELETE(request: Request, context: FindPostContext) {
  const result = await PostService.delete(new FindPostDto(context))
  return result.match(
    (response) => createResponse({ status: response.status, url: request.url }),
    (error) => {
      switch (error.type) {
        case 'unauthorized':
        case 'forbidden':
        case 'dto': {
          return createResponse({
            body: { type: error.type },
            status: error.status,
            url: request.url,
          })
        }
        case 'entity': {
          return createResponse({
            body: { type: error.type },
            status: error.status,
            url: request.url,
          })
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_DELETE_POST_ERROR',
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

export async function GET(request: Request, context: FindPostContext) {
  const result = await PostService.findOne(new FindPostDto(context))
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
        case 'dto': {
          return createResponse({
            body: { type: error.type },
            status: error.status,
            url: request.url,
          })
        }
        case 'entity': {
          return createResponse({
            body: { type: error.type },
            status: error.status,
            url: request.url,
          })
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_FIND_POST_ERROR',
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
