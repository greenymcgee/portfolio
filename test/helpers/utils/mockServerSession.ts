import { getServerSession } from 'next-auth/next'

import { User } from '@/prisma/generated/client'
import { ADMIN_USER, BASIC_USER } from '@/test/fixtures'

import { createJWTMock } from './createJWTMock'

/**
 * Useful for mocking an authenticated user for tests that don't require a test
 * db.
 */
export function mockServerSession(role: OneOf<User['roles']> | null) {
  if (role === null) {
    vi.mocked(getServerSession).mockResolvedValue(null)
    return { token: null, user: null }
  }

  const user = role === 'ADMIN' ? ADMIN_USER : BASIC_USER
  const token = createJWTMock(user)
  const result = {
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
  vi.mocked(getServerSession).mockResolvedValue(result)
  return result
}
