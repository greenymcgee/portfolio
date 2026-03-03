import { PrismaError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

import { tryCountPosts } from '..'

vi.mock('@/lib/prisma', () => {
  return { prisma: { post: { count: vi.fn() } } }
})

describe('tryCountPosts', () => {
  it('should return an error', async () => {
    const error = new Error()
    const prismaError = new PrismaError(error)
    vi.mocked(prisma.post.count).mockRejectedValue(error)
    const result = await tryCountPosts()
    expect(result).toEqual(prismaError)
  })

  it('should return a response', async () => {
    const response = 42
    vi.mocked(prisma.post.count).mockResolvedValue(response)
    const result = await tryCountPosts()
    expect(result).toBe(response)
  })
})
