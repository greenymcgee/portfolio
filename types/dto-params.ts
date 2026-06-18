import type { ZodError } from 'zod'

export type DtoParams<Dto extends { params: unknown }> = Exclude<
  Dto['params'],
  ZodError | Error
>
