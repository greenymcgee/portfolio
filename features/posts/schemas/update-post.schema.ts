import { coerce, object, string } from 'zod'

export const updatePostSchema = object({
  content: string()
    .optional()
    .nullable()
    .transform((value) => value || null),
  description: string()
    .max(100)
    .optional()
    .nullable()
    .transform((value) => {
      return typeof value === 'string' ? value : ''
    }),
  id: coerce.number().int().min(1),
  title: string().min(1),
})
