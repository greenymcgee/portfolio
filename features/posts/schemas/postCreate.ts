import { date, infer as zodInfer, json, object, string } from 'zod'

export const postCreateSchema = object({
  content: json().nullable(),
  publishedAt: date().nullable(),
  title: string().min(1),
})

export type PostCreateParams = zodInfer<typeof postCreateSchema>
