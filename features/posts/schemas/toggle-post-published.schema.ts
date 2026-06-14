import { coerce, object, string } from 'zod'

export const togglePostPublishedSchema = object({
  content: string().min(1),
  description: string().min(1).max(100),
  id: coerce.number().int().min(1),
  publishedAt: string(),
  title: string().min(1),
})
