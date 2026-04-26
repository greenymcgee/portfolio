import { ActionState } from '@greenymcgee/typescript-utils'
import { flattenError } from 'zod'

export interface CreateUserState extends ActionState {
  email?: FormDataEntryValue | null
  error?: ReturnType<typeof flattenError>
  firstName?: FormDataEntryValue | null
  lastName?: FormDataEntryValue | null
  username?: FormDataEntryValue | null
}
