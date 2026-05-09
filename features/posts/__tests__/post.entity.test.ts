import { postFactory } from '@/test/factories'
import { prismaMock } from '@/test/mocks/prisma-mock'

import { PostEntity } from '../post.entity'

afterEach(() => {
  vi.resetAllMocks()
  vi.useRealTimers()
})

describe('PostEntity', () => {
  describe('count', () => {
    it('should query posts where publishedAt is null when unpublished is true', async () => {
      prismaMock.post.count.mockResolvedValueOnce(18)
      await PostEntity.count({ unpublished: true })
      expect(prismaMock.post.count).toHaveBeenCalledWith({
        where: { publishedAt: null },
      })
    })

    it('should query posts where publishedAt is at or before the current time when unpublished is false', async () => {
      const now = new Date('2026-05-10T12:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      prismaMock.post.count.mockResolvedValueOnce(18)
      await PostEntity.count({ unpublished: false })
      expect(prismaMock.post.count).toHaveBeenCalledWith({
        where: { publishedAt: { lte: now } },
      })
    })
  })

  describe('findMany', () => {
    it('should query posts where publishedAt is null when unpublished is true', async () => {
      prismaMock.post.findMany.mockResolvedValueOnce([])
      await PostEntity.findMany({
        limit: 5,
        offset: 10,
        unpublished: true,
      })
      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 5,
        where: { publishedAt: null },
      })
    })

    it('should query posts where publishedAt is at or before the current time when unpublished is false', async () => {
      const now = new Date('2026-05-10T12:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      prismaMock.post.findMany.mockResolvedValueOnce([])
      await PostEntity.findMany({
        limit: 5,
        offset: 10,
        unpublished: false,
      })
      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 5,
        where: { publishedAt: { lte: now } },
      })
    })

    it('should return the result from Prisma findMany', async () => {
      const posts = [postFactory.build()]
      prismaMock.post.findMany.mockResolvedValueOnce(posts)
      const result = await PostEntity.findMany({
        limit: 10,
        offset: 0,
        unpublished: false,
      })
      expect(result).toBe(posts)
    })
  })
})
