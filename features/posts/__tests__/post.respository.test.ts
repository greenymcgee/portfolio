import { faker } from '@faker-js/faker'
import { ZodError } from 'zod'

import { NO_CONTENT } from '@/globals/constants'
import { NotFoundError, PrismaError, RequestJSONError } from '@/lib/errors'
import { postFactory } from '@/test/factories'
import {
  ADMIN_USER,
  LEXICAL_EDITOR_JSON,
  POSTS,
  PUBLISHED_POST,
} from '@/test/fixtures'
import { prismaMock } from '@/test/mocks/prisma-mock'

import { FindAndCountPostsDto, FindPostDto } from '../dto'
import { CreatePostDto } from '../dto/create-post.dto'
import { PostRepository } from '../post.repository'

describe('PostRepository', () => {
  describe('create', () => {
    it('should return a json error', async () => {
      const request = new Request('http://greeny.no/posts', {
        body: '{',
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await PostRepository.create(dto, ADMIN_USER)
      expect(result).toEqual(expect.any(RequestJSONError))
    })

    it('should return a Zod error', async () => {
      const params = {
        content: 1,
        publishedAt: null,
        title: faker.book.title(),
      }
      const request = new Request('http://greeny.no/posts', {
        body: JSON.stringify(params),
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await PostRepository.create(dto, ADMIN_USER)
      expect(result).toEqual(expect.any(ZodError))
    })

    it('should return a Lexical validation error', async () => {
      const request = new Request('http://greeny.no/posts', {
        body: JSON.stringify({
          content: 'not-json',
          publishedAt: null,
          title: faker.book.title(),
        }),
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await PostRepository.create(dto, ADMIN_USER)
      expect(result).toEqual(new Error('Post content validation failed'))
    })

    it('should return a Prisma error', async () => {
      const error = new Error('Bad')
      prismaMock.post.create.mockRejectedValueOnce(error)
      const params = {
        content: LEXICAL_EDITOR_JSON,
        publishedAt: null,
        title: faker.book.title(),
      }
      const request = new Request('http://greeny.no/posts', {
        body: JSON.stringify(params),
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await PostRepository.create(dto, ADMIN_USER)
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return the created post', async () => {
      const created = postFactory.build()
      prismaMock.post.create.mockResolvedValueOnce(created)
      const params = {
        content: LEXICAL_EDITOR_JSON,
        publishedAt: null,
        title: faker.book.title(),
      }
      const request = new Request('http://greeny.no/posts', {
        body: JSON.stringify(params),
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await PostRepository.create(dto, ADMIN_USER)
      expect(result).toBe(created)
    })
  })

  describe('delete', () => {
    it('should return a dto error for an invalid id', async () => {
      const result = await PostRepository.delete(
        new FindPostDto({ params: Promise.resolve({ id: 'invalid' }) }),
      )
      expect(result).toEqual(expect.any(ZodError))
    })

    it('should return a PrismaError when the delete errors', async () => {
      const error = new Error('bad')
      prismaMock.post.delete.mockRejectedValueOnce(error)
      const result = await PostRepository.delete(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a NotFoundError for a null response', async () => {
      const id = 1
      prismaMock.post.delete.mockRejectedValueOnce(null)
      const result = await PostRepository.delete(
        new FindPostDto({ params: Promise.resolve({ id: id.toString() }) }),
      )
      expect(result).toEqual(new NotFoundError(id, 'Post'))
    })

    it('should return a No Content response upon success', async () => {
      prismaMock.post.delete.mockResolvedValueOnce(PUBLISHED_POST)
      const result = await PostRepository.delete(
        new FindPostDto({
          params: Promise.resolve({ id: String(PUBLISHED_POST.id) }),
        }),
      )
      expect(result).toEqual({ status: NO_CONTENT })
    })
  })

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
      prismaMock.post.findUnique.mockRejectedValueOnce(error)
      const result = await PostRepository.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a NotFoundError for a null response', async () => {
      const id = 1
      prismaMock.post.findUnique.mockResolvedValueOnce(null)
      const result = await PostRepository.findOne(
        new FindPostDto({ params: Promise.resolve({ id: id.toString() }) }),
      )
      expect(result).toEqual(new NotFoundError(id, 'Post'))
    })

    it('should return the post', async () => {
      prismaMock.post.findUnique.mockResolvedValueOnce(PUBLISHED_POST)
      const result = await PostRepository.findOne(
        new FindPostDto({
          params: Promise.resolve({ id: String(PUBLISHED_POST.id) }),
        }),
      )
      expect(result).toBe(PUBLISHED_POST)
    })
  })
})
