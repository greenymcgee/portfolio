import { infer as zodInfer, object, string } from 'zod'

export const createUserSchema = object({
  email: string().email(),
  firstName: string().min(1),
  lastName: string().min(1),
  password: string()
    .min(8)
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  username: string().min(1),
})

export type CreateUserParams = zodInfer<typeof createUserSchema>
