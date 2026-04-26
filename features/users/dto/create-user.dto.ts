import { logger } from '@/lib/logger'

import { createUserSchema } from '../schemas'

export class CreateUserDto {
  private formData: FormData

  constructor(formData: FormData) {
    this.formData = formData
  }

  public get params() {
    const { data, error } = createUserSchema.safeParse(
      Object.fromEntries(this.formData),
    )
    if (error) {
      logger.error({ error }, 'CreateUserDto Zod error:')
      return error
    }

    return data
  }
}
