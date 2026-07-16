import { object, string } from 'zod'

function transformString(value: string | null | undefined) {
  if (typeof value === 'string' || value === undefined) return value

  return undefined
}

export const updatePostSchema = object({
  content: string().nullable().optional().transform(transformString),
  description: string()
    .max(100)
    .optional()
    .nullable()
    .transform(transformString),
  title: string().min(1).optional().nullable().transform(transformString),
})
