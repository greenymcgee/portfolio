import { coerce, infer as zodInfer, object } from 'zod'

export const getPostsSchema = object({
  limit: coerce
    .number()
    .int()
    .nonnegative()
    .max(50)
    .transform((limit) => limit || 10),
  page: coerce.number().int().nonnegative(),
})

export type GetPostsParams = zodInfer<typeof getPostsSchema>
