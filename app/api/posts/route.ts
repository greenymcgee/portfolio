import { CreatePostDto } from '@/features/posts/dto/create-post.dto'
import { PostService } from '@/features/posts/post.service'
import { INTERNAL_SERVER_ERROR } from '@/globals/constants'
import { createResponse } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  const result = await PostService.create(new CreatePostDto(request))
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
        case 'dto':
          return createResponse({
            body: { type: error.type },
            status: error.status,
            url: request.url,
          })
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
