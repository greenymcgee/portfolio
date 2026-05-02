import { coerce, object, string } from 'zod'

function transformString(value: string | undefined | null) {
  return typeof value === 'string' ? value : ''
}

export const createPostSchema = object({
  content: string().optional().nullable().transform(transformString),
  description: string()
    .max(100)
    .optional()
    .nullable()
    .transform(transformString),
  publishedAt: coerce
    .date()
    .nullable()
    .optional()
    .transform((date) => {
      if (typeof date === 'string' || typeof date === 'object') return date

      return null
    }),
  title: string().nullable().optional().transform(transformString),
})
