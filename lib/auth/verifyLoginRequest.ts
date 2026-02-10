import bcrypt from 'bcryptjs'

import { prisma } from '../prisma'

type LoginCredentials = Record<'email' | 'password', string> | undefined

const error = new Error('Invalid credentials')

export async function verifyLoginRequest(credentials: LoginCredentials) {
  if (!credentials?.email || !credentials?.password) throw error

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  })
  if (!user) throw error

  const isCorrectPassword = await bcrypt.compare(
    credentials.password,
    user.password,
  )
  if (!isCorrectPassword) throw error

  return user
}
