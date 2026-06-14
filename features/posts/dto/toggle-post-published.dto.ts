import type { ZodError } from 'zod'

import { logger } from '@/lib/logger'
import { validateLexicalContent } from '@/lib/utils'
import type { Post } from '@/prisma/generated/client'
import type { PostUpdateInput } from '@/prisma/generated/models'

import { togglePostPublishedSchema } from '../schemas'

type Params = {
  content?: string | null
  description?: string | null
  id?: string | null
  publishedAt?: string | null
  title?: string | null
}

export class TogglePostPublishedDto {
  private content: PostUpdateInput['content'] = undefined

  private description: PostUpdateInput['description'] = ''

  private id: Post['id'] = NaN

  private error: ZodError | Error | null = null

  private publishedAt: PostUpdateInput['publishedAt'] = null

  private title: PostUpdateInput['title'] = ''

  constructor(params: Params) {
    this.validateParams(params)
  }

  public get params() {
    if (this.error) return this.error

    return {
      content: this.content,
      description: this.description,
      id: this.id,
      publishedAt: this.publishedAt,
      title: this.title,
    }
  }

  private validateContent() {
    const { error } = validateLexicalContent(this.content)
    if (error === null) return

    logger.error(
      { error },
      'TogglePostPublished Lexical content validation error:',
    )
    this.error = new Error('Post content validation failed', {
      cause: { error },
    })
  }

  private validateParams(params: Params) {
    const { data, error } = togglePostPublishedSchema.strict().safeParse(params)
    if (error) {
      logger.error({ error }, 'TogglePostPublished Zod error:')
      this.error = error
      return error
    }

    this.content = data.content
    this.validateContent()
    this.description = data.description
    this.id = data.id
    this.publishedAt = data.publishedAt
    this.title = data.title
    return data
  }
}
