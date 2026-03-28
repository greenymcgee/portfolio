import { ZodError } from 'zod'

import { HTTP_TEXT_BY_STATUS, NOT_FOUND } from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { POSTS, PUBLISHED_POST } from '@/test/fixtures'
import { prismaMock } from '@/test/mocks/prisma-mock'

import { FindAndCountPostsDto, FindPostDto } from '../dto'
import { PostRepository } from '../post.repository'

describe('PostRepository', () => {
  describe('findAndCount', () => {
    it('should return a dto error', async () => {
      const result = await PostRepository.findAndCount(
        new FindAndCountPostsDto(new Request('http://greeny.no?limit=invalid')),
      )
      expect(result).toEqual(expect.any(ZodError))
    })

    it('should return a findMany error', async () => {
      const error = new Error('Bad')
      prismaMock.post.findMany.mockRejectedValue(error)
      const result = await PostRepository.findAndCount(
        new FindAndCountPostsDto(new Request('http://greeny.no')),
      )
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a count error', async () => {
      const error = new Error('Bad')
      prismaMock.post.findMany.mockResolvedValueOnce(POSTS)
      prismaMock.post.count.mockRejectedValue(error)
      const result = await PostRepository.findAndCount(
        new FindAndCountPostsDto(new Request('http://greeny.no')),
      )
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return posts and a total count', async () => {
      const limit = 10
      prismaMock.post.findMany.mockResolvedValueOnce(POSTS)
      prismaMock.post.count.mockResolvedValueOnce(limit * 2)
      const result = await PostRepository.findAndCount(
        new FindAndCountPostsDto(new Request('http://greeny.no')),
      )
      expect(result).toEqual({ posts: POSTS, totalPages: 2 })
    })
  })

  describe('findOne', () => {
    it('should return a dto error', async () => {
      const result = await PostRepository.findOne(
        new FindPostDto({ params: Promise.resolve({ id: 'invalid' }) }),
      )
      expect(result).toEqual(expect.any(ZodError))
    })

    it('should return a prisma error', async () => {
      const error = new Error('Bad')
      prismaMock.post.findFirst.mockRejectedValueOnce(error)
      const result = await PostRepository.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a not found error', async () => {
      prismaMock.post.findFirst.mockResolvedValueOnce(null)
      const result = await PostRepository.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(
        new Error(HTTP_TEXT_BY_STATUS[NOT_FOUND], {
          cause: { status: NOT_FOUND },
        }),
      )
    })

    it('should return the post', async () => {
      prismaMock.post.findFirst.mockResolvedValueOnce(PUBLISHED_POST)
      const result = await PostRepository.findOne(
        new FindPostDto({
          params: Promise.resolve({ id: String(PUBLISHED_POST.id) }),
        }),
      )
      expect(result).toBe(PUBLISHED_POST)
    })
  })
})
