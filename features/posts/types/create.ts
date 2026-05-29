import type { ActionState } from '@greenymcgee/typescript-utils'
import type { $ZodFlattenedError } from 'zod/v4/core'

import type { Post } from '@/prisma/generated/client'

export interface CreatePostState extends ActionState {
  content?: FormDataEntryValue | null
  description?: FormDataEntryValue | null
  error?: $ZodFlattenedError<unknown>
  errorType?: ActionError
  response?: { message: string; post: Post }
  publishedAt?: FormDataEntryValue | null
  title?: FormDataEntryValue | null
}
