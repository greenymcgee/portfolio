import { email, object, string } from 'zod'

export const signInSchema = object({
  email: email('Invalid email address'),
  password: string('Password required'),
})
