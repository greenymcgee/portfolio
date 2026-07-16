import type { ZodError } from 'zod'

import { logger } from '@/lib/logger'
import { validateLexicalContent } from '@/lib/utils'
import type { PostUpdateInput } from '@/prisma/generated/models'

import { updatePostSchema } from '../schemas'

type Params = {
  content?: string | null
  description?: string | null
  title?: string | null
}

export class UpdatePostDto {
  private content: PostUpdateInput['content'] = undefined

  private description: PostUpdateInput['description'] = ''

  private error: ZodError | Error | null = null

  private title: PostUpdateInput['title'] = ''

  constructor(params: Params) {
    this.validateParams(params)
  }

  public get params() {
    if (this.error) return this.error

    return {
      content: this.content,
      description: this.description,
      title: this.title,
    }
  }

  private validateContent() {
    const { error } = validateLexicalContent(this.content)
    if (error === null) return

    logger.error({ error }, 'UpdatePostDto Lexical content validation error:')
    this.error = new Error('Post content validation failed', {
      cause: { error },
    })
  }

  private validateParams(params: Params) {
    const { data, error } = updatePostSchema.strict().safeParse(params)
    if (error) {
      logger.error({ error }, 'UpdatePostDto Zod error:')
      this.error = error
      return error
    }

    this.content = data.content
    this.validateContent()
    this.description = data.description
    this.title = data.title
    return data
  }
}
