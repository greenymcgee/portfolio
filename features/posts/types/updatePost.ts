import type { ActionState } from '@greenymcgee/typescript-utils'
import type { $ZodFlattenedError } from 'zod/v4/core'

import type { Post } from '@/prisma/generated/client'

export interface UpdatePostState extends ActionState {
  content?: FormDataEntryValue | null
  description?: FormDataEntryValue | null
  dtoError?: $ZodFlattenedError<{
    content: string | null
    description: string
    title: string
  }>
  errorType?: ActionError
  id: number
  response?: { message: string; post: Post }
  threwUniqueConstraintError?: boolean
  title?: FormDataEntryValue | null
}

export type TogglePostPublishedState = ActionState & {
  id: number
  publishedAt?: FormDataEntryValue | null
}
