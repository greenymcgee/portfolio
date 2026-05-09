import type { ZodError } from 'zod'

import { createHeadlessBlogEditor } from '@/lib/lexical'
import { logger } from '@/lib/logger'
import type { Post } from '@/prisma/generated/client'

import { updatePostSchema } from '../schemas'

type Params = {
  content?: string | null
  description?: string | null
  id?: string | null
  title?: string | null
}

export class UpdatePostDto {
  private content: Post['content'] = null

  private description: Post['description'] = ''

  private id: Post['id'] = NaN

  private error: ZodError | Error | null = null

  private title: Post['title'] = ''

  constructor(params: Params) {
    this.validateParams(params)
  }

  public get params() {
    if (this.error) return this.error

    return {
      content: this.content,
      description: this.description,
      id: this.id,
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
      logger.error({ error }, 'UpdatePostDto Lexical content validation error:')
      this.error = new Error('Post content validation failed', {
        cause: { error },
      })
    }
  }

  private validateParams(params: Params) {
    const { data, error } = updatePostSchema.strict().safeParse(params)
    if (error) {
      logger.error({ error }, 'UpdatePostDto Zod error:')
      this.error = error
      return error
    }

    this.content = data.content
    this.validateContentSafety()
    this.description = data.description
    this.id = data.id
    this.title = data.title
    return data
  }
}
