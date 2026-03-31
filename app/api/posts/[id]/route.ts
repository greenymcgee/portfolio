import { FindPostDto } from '@/features/posts/dto/find-post.dto'
import { PostService } from '@/features/posts/post.service'
import { INTERNAL_SERVER_ERROR } from '@/globals/constants'
import { createResponse } from '@/lib/db'
import { logger } from '@/lib/logger'

type GETContext = FirstConstructorParameterOf<typeof FindPostDto>

export async function GET(request: Request, context: GETContext) {
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
