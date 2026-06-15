import { ZodError } from 'zod'

import { logger } from '@/lib/logger'
import type { DtoParams } from '@/types/dto-params'

import { findAndCountPostsSchema } from '../schemas'
import type { FindAndCountPostsDtoError } from '../types'

type Params = { limit?: string; page?: string; unpublished?: string }

export type FindAndCountPostParams = DtoParams<FindAndCountPostsDto>

export class FindAndCountPostsDto {
  private error: FindAndCountPostsDtoError | null = null

  private limit = 10

  private page = 0

  private unpublished = false

  constructor(params: Params) {
    this.validateParams(params)
  }

  public get params() {
    if (this.error instanceof ZodError) return this.error

    return {
      currentPage: this.currentPage,
      limit: this.limit,
      offset: this.offset,
      unpublished: this.unpublished,
    }
  }

  private get currentPage() {
    return this.offset / this.limit
  }

  private get offset() {
    return this.page * this.limit
  }

  private validateParams(params: Params) {
    const { data, error } = findAndCountPostsSchema.strict().safeParse(params)
    if (error) {
      logger.error({ error }, 'FindAndCountPostsDto error:')
      this.error = error
      return
    }

    this.limit = data.limit
    this.page = data.page
    this.unpublished = data.unpublished
  }
}
