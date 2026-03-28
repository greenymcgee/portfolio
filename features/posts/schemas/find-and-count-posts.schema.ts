import { coerce, object } from 'zod'

export const findAndCountPostsSchema = object({
  limit: coerce
    .number()
    .int()
    .nonnegative()
    .max(50)
    .transform((limit) => limit || 10),
  page: coerce
    .number()
    .int()
    .nonnegative()
    .transform((page) => page || 0),
})
