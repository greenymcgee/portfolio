import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'
import { User } from '@/prisma/generated/client'
import { ADMIN_USER, BASIC_USER } from '@/test/fixtures'

import { createJWTMock } from './createJWTMock'

/**
 * Useful for mocking an authenticated user for tests that require a test db.
 */
export async function mockServerSessionAsync(role: OneOf<User['roles']>) {
  const user = await prisma.user.findUnique({
    where: { email: role === 'ADMIN' ? ADMIN_USER.email : BASIC_USER.email },
  })

  if (!user) {
    throw new Error('Users must be seeded before mocking a user session')
  }

  const token = createJWTMock(user)
  const session = {
    expires: token.exp,
    token,
    user: {
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      roles: user.roles,
      username: user.username,
    },
  }
  vi.mocked(getServerSession).mockResolvedValue(session)
  return session
}
