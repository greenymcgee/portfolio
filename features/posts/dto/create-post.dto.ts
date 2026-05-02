import type { ZodError } from 'zod'

import { createHeadlessBlogEditor } from '@/lib/lexical'
import { logger } from '@/lib/logger'
import type { Post } from '@/prisma/generated/client'

import { createPostSchema } from '../schemas'

type Params = {
  content?: string | null
  description?: string | null
  publishedAt?: string | null
  title?: string | null
}

export class CreatePostDto {
  private content: Post['content'] = null

  private description: Post['description'] = ''

  private error: ZodError | Error | null = null

  private publishedAt: Post['publishedAt'] = null

  private title: Post['title'] = ''

  constructor(params: Params) {
    this.validateParams(params)
  }

  public get params() {
    if (this.error) return this.error

    return {
      content: this.content,
      description: this.description,
      publishedAt: this.publishedAt,
      title: this.title,
    }
  }

  /**
   * Ensures the content passes a parseEditorState check before saving in the
   * DB.
   *
   * @returns void
   */
  private validateContentSafety() {
    const editor = createHeadlessBlogEditor()
    try {
      if (typeof this.content !== 'string' || !this.content.length) return

      editor.parseEditorState(this.content)
    } catch (error) {
      logger.error({ error }, 'CreatePostDto Lexical content validation error:')
      this.error = new Error('Post content validation failed', {
        cause: { error },
      })
    }
  }

  private validateParams(params: Params) {
    const { data, error } = createPostSchema.strict().safeParse(params)
    if (error) {
      logger.error({ error }, 'CreatePostDto Zod error:')
      this.error = error
      return error
    }

    this.content = data.content
    this.validateContentSafety()
    this.description = data.description
    this.publishedAt = data.publishedAt
    this.title = data.title
    return data
  }
}
