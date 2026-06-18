import { ZodError } from 'zod'

import { logger } from '@/lib/logger'

import { findPostSchema } from '../schemas'

type Params = { id: number }

export class FindPostDto {
  private error: ZodError | null = null

  private id: AuthoredPost['id'] = NaN

  constructor(params: Params) {
    this.validateParams(params)
  }

  public get params() {
    if (this.error) return this.error

    return { id: this.id }
  }

  private validateParams(params: Params) {
    const { data, error } = findPostSchema.strict().safeParse(params)
    if (error) {
      logger.error({ error }, `FindPostDto error: ${params.id}`)
      this.error = error
      return
    }

    this.id = data.id
  }
}
