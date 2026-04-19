import { coerce } from 'zod'

import { logger } from '@/lib/logger'

export class FindPostDto {
  private param: AuthoredPost['id']

  constructor(id: AuthoredPost['id']) {
    this.param = id
  }

  public get id() {
    const { data, error } = coerce.number().min(1).safeParse(this.param)
    if (error) {
      logger.error({ error }, `FindPostDto error: ${this.param}`)
      return error
    }

    return data
  }
}
