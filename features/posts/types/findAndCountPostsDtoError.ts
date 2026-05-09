import type { ZodError } from 'zod'

export type FindAndCountPostsDtoError = ZodError<{
  limit: number
  page: number
  unpublished: boolean
}>
