import { ZodError } from 'zod'

import { logger } from '@/lib/logger'

import { findAndCountPostsSchema } from '../schemas'

type Params = { limit?: string; page?: string }

export class FindAndCountPostsDto {
  private error: ZodError | null = null

  private limit = 10

  private page = 0

  constructor(params: Params) {
    this.validateParams(params)
  }

  public get params() {
    if (this.error instanceof ZodError) return this.error

    return { limit: this.limit, page: this.page }
  }

  public get currentPage() {
    return this.offset / this.limit
  }

  public get offset() {
    return this.page * this.limit
  }

  private validateParams(params: Params) {
    const { data, error } = findAndCountPostsSchema.safeParse(params)
    if (error) {
      logger.error({ error }, 'FindAndCountPostsDto error:')
      this.error = error
      return
    }

    this.limit = data.limit
    this.page = data.page
  }
}
