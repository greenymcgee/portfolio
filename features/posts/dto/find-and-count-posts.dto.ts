import { ZodError } from 'zod'

import { logger } from '@/lib/logger'

import { findAndCountPostsSchema } from '../schemas'

export class FindAndCountPostsDto {
  private error: ZodError | null = null

  private limit = 10

  private page = 0

  private url: URL

  constructor(request: Request) {
    this.url = new URL(request.url)
  }

  public get params() {
    this.validateParams()
    if (this.error) return this.error

    return { limit: this.limit, offset: this.offset }
  }

  private get offset() {
    if (this.page) return this.page * this.limit

    return this.page
  }

  private get searchParams() {
    const { searchParams } = this.url
    return { limit: searchParams.get('limit'), page: searchParams.get('page') }
  }

  private validateParams() {
    const { data, error } = findAndCountPostsSchema.safeParse(this.searchParams)
    if (error) {
      logger.error({ error }, 'FindAndCountPostsDto error:')
      this.error = error
      return
    }

    this.limit = data.limit
    this.page = data.page
  }
}
