import { getToken } from 'next-auth/jwt'

import { User } from '@/prisma/generated/client'
import { ADMIN_USER, BASIC_USER } from '@/test/fixtures'

import { createJWTMock } from './createJWTMock'

/**
 * Useful for mocking an authenticated user for tests that don't require a test
 * db.
 */
export function mockUserServerSession(role: OneOf<User['roles']> | null) {
  if (role === null) {
    vi.mocked(getToken).mockResolvedValue(null)
    return role
  }

  const user = role === 'ADMIN' ? ADMIN_USER : BASIC_USER
  const token = createJWTMock(user)
  vi.mocked(getToken).mockResolvedValue(token)
  return token
}
