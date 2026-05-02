import type { ActionState } from '@greenymcgee/typescript-utils'
import type { $ZodFlattenedError } from 'zod/v4/core'

export interface CreateUserState extends ActionState {
  email?: FormDataEntryValue | null
  error?: $ZodFlattenedError<unknown>
  firstName?: FormDataEntryValue | null
  lastName?: FormDataEntryValue | null
  username?: FormDataEntryValue | null
}
