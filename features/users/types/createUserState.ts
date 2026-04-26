import { ActionState } from '@greenymcgee/typescript-utils'
import { ZodError } from 'zod'

export interface CreateUserState extends ActionState {
  email?: FormDataEntryValue | null
  error?: ZodError
  firstName?: FormDataEntryValue | null
  lastName?: FormDataEntryValue | null
  username?: FormDataEntryValue | null
}
