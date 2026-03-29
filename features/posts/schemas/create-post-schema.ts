import { date, infer as zodInfer, object, string } from 'zod'

export const createPostSchema = object({
  content: string().min(2),
  publishedAt: date().nullable(),
  title: string().min(1),
})

export type CreatePostParams = zodInfer<typeof createPostSchema>
