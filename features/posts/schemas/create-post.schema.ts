import { coerce, infer as zodInfer, object, string } from 'zod'

export const createPostSchema = object({
  content: string().min(2),
  description: string()
    .max(100)
    .optional()
    .nullable()
    .transform((description) =>
      typeof description === 'string' ? description : '',
    ),
  publishedAt: coerce.date().nullable(),
  title: string().min(1),
})

export type CreatePostParams = zodInfer<typeof createPostSchema>
