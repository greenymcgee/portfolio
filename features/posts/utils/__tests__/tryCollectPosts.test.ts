import { PrismaError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { POSTS } from '@/test/fixtures'

import { tryCollectPosts } from '..'

vi.mock('@/lib/prisma', () => {
  return { prisma: { post: { findMany: vi.fn() } } }
})

describe('tryCollectPosts', () => {
  it('should return an error', async () => {
    const error = new Error()
    const prismaError = new PrismaError(error)
    vi.mocked(prisma.post.findMany).mockRejectedValue(error)
    const result = await tryCollectPosts({ limit: 10, offset: 0 })
    expect(result).toEqual(prismaError)
  })

  it('should return a response', async () => {
    vi.mocked(prisma.post.findMany).mockResolvedValue(POSTS)
    const result = await tryCollectPosts({ limit: 10, offset: 0 })
    expect(result).toBe(POSTS)
  })
})
