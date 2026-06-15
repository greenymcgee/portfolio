import { coerce, object } from 'zod'

export const findPostSchema = object({ id: coerce.number().min(1) })
