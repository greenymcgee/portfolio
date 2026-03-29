import { coerce, ZodError } from 'zod'

import { logger } from '@/lib/logger'

type FindPostContext = { params: Promise<{ id: string }> }

export class FindPostDto {
  private context: FindPostContext

  constructor(context: FindPostContext) {
    this.context = context
  }

  public async getId() {
    const id = await this.validateId()
    if (id instanceof ZodError) return id

    return id
  }

  private async validateId() {
    const { id } = await this.context.params
    const { data, error } = coerce.number().min(1).safeParse(id)
    if (error) {
      logger.error({ error }, `FindPostDto error: ${id}`)
      return error
    }

    return data
  }
}
