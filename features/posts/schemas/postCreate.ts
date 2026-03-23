import { date, infer as zodInfer, object, string } from 'zod'

export const postCreateSchema = object({
  content: string().min(2),
  publishedAt: date().nullable(),
  title: string().min(1),
})

export type PostCreateParams = zodInfer<typeof postCreateSchema>
