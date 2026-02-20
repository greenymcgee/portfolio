// @vitest-environment node

import { prisma } from '@/lib/prisma'
import { User } from '@/prisma/generated/client'
import { ADMIN_USER } from '@/test/fixtures'
import { setupTestDatabase } from '@/test/helpers/utils'

import { verifyLoginRequest } from '../verifyLoginRequest'

setupTestDatabase({ withUsers: true })

describe('verifyLoginRequest', () => {
  it('should throw an error for a missing email', async () => {
    const result = () => verifyLoginRequest({ email: '', password: '123' })
    await expect(result).rejects.toThrow('Invalid credentials')
  })

  it('should throw an error for a missing password', async () => {
    const result = () => verifyLoginRequest({ email: 'email', password: '' })
    await expect(result).rejects.toThrow('Invalid credentials')
  })

  it('should throw an error for a missing user', async () => {
    const result = () => verifyLoginRequest({ email: 'email', password: '123' })
    await expect(result).rejects.toThrow('Invalid credentials')
  })

  it('should throw an error for an incorrect password', async () => {
    const result = () =>
      verifyLoginRequest({ email: ADMIN_USER.email, password: '123' })
    await expect(result).rejects.toThrow('Invalid credentials')
  })

  it('should return the user upon success', async () => {
    const result = await verifyLoginRequest({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
    })
    const user = (await prisma.user.findUnique({
      where: { email: ADMIN_USER.email },
    })) as User
    expect(result.id).toBe(user.id)
  })
})
