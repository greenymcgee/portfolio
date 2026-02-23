import { faker } from '@faker-js/faker'
import { getToken, JWT } from 'next-auth/jwt'

import { authenticateAPISession } from '..'

describe('authenticateAPISession', () => {
  it('should return null when the token request returns an error', async () => {
    vi.mocked(getToken).mockRejectedValue('No')
    const result = await authenticateAPISession(
      new Request('http://nothing.greeny'),
    )
    expect(result).toBeNull()
  })

  it('should return null when the token request returns a blank token', async () => {
    vi.mocked(getToken).mockResolvedValue(null)
    const result = await authenticateAPISession(
      new Request('http://nothing.greeny'),
    )
    expect(result).toBeNull()
  })

  it('should return null when the token request returns an expired token', async () => {
    vi.mocked(getToken).mockResolvedValue({
      exp: Math.floor(faker.date.past().getTime() / 1000),
    } as JWT)
    const result = await authenticateAPISession(
      new Request('http://nothing.greeny'),
    )
    expect(result).toBeNull()
  })

  it('should return the token when it is valid', async () => {
    const token = {
      exp: Math.floor(faker.date.future().getTime() / 1000),
    } as JWT
    vi.mocked(getToken).mockResolvedValue(token)
    const result = await authenticateAPISession(
      new Request('http://nothing.greeny'),
    )
    expect(result).toBe(token)
  })
})
