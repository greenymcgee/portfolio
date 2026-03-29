import { tryCatch } from '@greenymcgee/typescript-utils'

import { RequestJSONError } from '@/lib/errors'
import { logger } from '@/lib/logger'

import { CreatePostParams, createPostSchema } from '../schemas'

export class CreatePostDto {
  private request: Request

  constructor(request: Request) {
    this.request = request
  }

  public async getParams() {
    const json = await this.parseJSON()
    if (json instanceof RequestJSONError) return json

    const { data, error } = createPostSchema.safeParse(json)
    if (error) {
      logger.error({ error }, 'CreatePostDto Zod error:')
      return error
    }

    return data
  }

  private async parseJSON() {
    const { error, response: json } = await tryCatch<CreatePostParams>(
      this.request.json(),
    )
    if (error) {
      logger.error({ error }, 'CreatePostDto JSON error:')
      return new RequestJSONError(error)
    }

    return json
  }
}
