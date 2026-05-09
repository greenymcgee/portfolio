import { coerce, object, stringbool } from 'zod'

export const findAndCountPostsSchema = object({
  limit: coerce
    .number()
    .int()
    .nonnegative()
    .max(50)
    .optional()
    .transform((limit) => limit || 10),
  page: coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .transform((page) => page || 0),
  unpublished: stringbool()
    .optional()
    .transform((value) => value ?? false),
})
