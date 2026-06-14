import { coerce, object, string } from 'zod'

/**
 * Everything is required from the form upon every submission whether it's from
 * the Close button, the description modal, or the autosave.
 */
export const updatePostSchema = object({
  content: string()
    .nullable()
    .transform((value) => (typeof value === 'string' ? value : undefined)),
  description: string().max(100),
  id: coerce.number().int().min(1),
  title: string().min(1),
})
