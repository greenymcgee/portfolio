import { getServerSession } from 'next-auth/next'

import { mockServerSession } from '@/test/helpers/utils'

import { authenticateAPISession } from '..'

describe('authenticateAPISession', () => {
  it('should return null when getServerSession returns a null session', async () => {
    mockServerSession(null)
    const result = await authenticateAPISession()
    expect(result).toBeNull()
  })

  it('should return null when getServerSession returns a null user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: null })
    const result = await authenticateAPISession()
    expect(result).toBeNull()
  })

  it('should return the session user when it is present', async () => {
    const { user } = mockServerSession('ADMIN')
    const result = await authenticateAPISession()
    expect(result).toBe(user)
  })
})
