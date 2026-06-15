import { faker } from '@faker-js/faker'

import { NO_CONTENT } from '@/globals/constants'
import { NotFoundError, PrismaError } from '@/lib/errors'
import type { Post } from '@/prisma/generated/client'
import { postFactory } from '@/test/factories'
import {
  ADMIN_USER,
  LEXICAL_EDITOR_JSON,
  POSTS,
  PUBLISHED_POST,
} from '@/test/fixtures'
import { prismaMock } from '@/test/mocks/prisma-mock'

import { PostRepository } from '../post.repository'

afterEach(() => {
  vi.resetAllMocks()
})

describe('PostRepository', () => {
  describe('create', () => {
    it('should return a Prisma error', async () => {
      const error = new Error('Bad')
      prismaMock.post.create.mockRejectedValueOnce(error)
      const result = await PostRepository.create(
        {
          content: LEXICAL_EDITOR_JSON,
          description: faker.lorem.sentence(),
          publishedAt: null,
          title: faker.book.title(),
        },
        ADMIN_USER,
      )
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return the created post', async () => {
      const created = postFactory.build()
      prismaMock.post.create.mockResolvedValueOnce(created)
      const result = await PostRepository.create(
        {
          content: LEXICAL_EDITOR_JSON,
          description: created.description,
          publishedAt: created.publishedAt,
          title: created.title,
        },
        ADMIN_USER,
      )
      expect(result).toBe(created)
    })
  })

  describe('delete', () => {
    it('should return a PrismaError when the delete errors', async () => {
      const error = new Error('bad')
      prismaMock.post.delete.mockRejectedValueOnce(error)
      const result = await PostRepository.delete(1)
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a NotFoundError for a null response', async () => {
      const id = 1
      prismaMock.post.delete.mockRejectedValueOnce(null)
      const result = await PostRepository.delete(id)
      expect(result).toEqual(new NotFoundError(id, 'Post'))
    })

    it('should return a No Content response upon success', async () => {
      prismaMock.post.delete.mockResolvedValueOnce(PUBLISHED_POST)
      const result = await PostRepository.delete(PUBLISHED_POST.id)
      expect(result).toEqual({ status: NO_CONTENT })
    })
  })

  describe('findAndCount', () => {
    it('should return a Prisma findMany error', async () => {
      const error = new Error('Bad')
      prismaMock.post.findMany.mockRejectedValue(error)
      const result = await PostRepository.findAndCount({
        currentPage: 1,
        limit: 10,
        offset: 0,
        unpublished: false,
      })
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a Prisma count error', async () => {
      const error = new Error('Bad')
      prismaMock.post.findMany.mockResolvedValueOnce(POSTS)
      prismaMock.post.count.mockRejectedValue(error)
      const result = await PostRepository.findAndCount({
        currentPage: 1,
        limit: 10,
        offset: 0,
        unpublished: false,
      })
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return posts and a total count', async () => {
      const limit = 10
      const count = limit * 2
      prismaMock.post.findMany.mockResolvedValueOnce(POSTS)
      prismaMock.post.count.mockResolvedValueOnce(count)
      const result = await PostRepository.findAndCount({
        currentPage: 1,
        limit,
        offset: 0,
        unpublished: false,
      })
      expect(result).toEqual({
        currentPage: 1,
        offset: 0,
        posts: POSTS,
        totalPages: count / limit,
      })
    })
  })

  describe('findOne', () => {
    it('should return a prisma error', async () => {
      const error = new Error('Bad')
      prismaMock.post.findUnique.mockRejectedValueOnce(error)
      const result = await PostRepository.findOne(1)
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a NotFoundError for a null response', async () => {
      const id = 1
      prismaMock.post.findUnique.mockResolvedValueOnce(null)
      const result = await PostRepository.findOne(id)
      expect(result).toEqual(new NotFoundError(id, 'Post'))
    })

    it('should return the post', async () => {
      prismaMock.post.findUnique.mockResolvedValueOnce(PUBLISHED_POST)
      const result = await PostRepository.findOne(PUBLISHED_POST.id)
      expect(result).toBe(PUBLISHED_POST)
    })
  })

  describe('update', () => {
    it('should return a Prisma error', async () => {
      const error = new Error('Bad')
      prismaMock.post.update.mockRejectedValueOnce(error)
      const result = await PostRepository.update(PUBLISHED_POST.id, {
        content: LEXICAL_EDITOR_JSON,
        description: PUBLISHED_POST.description,
        title: PUBLISHED_POST.title,
      })
      expect(result).toEqual(new PrismaError(error))
    })

    it('should return a NotFoundError for a null response', async () => {
      const id = PUBLISHED_POST.id
      prismaMock.post.update.mockResolvedValueOnce(null as unknown as Post)
      const result = await PostRepository.update(id, {
        content: LEXICAL_EDITOR_JSON,
        description: PUBLISHED_POST.description,
        title: PUBLISHED_POST.title,
      })
      expect(result).toEqual(new NotFoundError(id, 'Post'))
    })

    it('should return the updated post', async () => {
      const updated = postFactory.build({ id: PUBLISHED_POST.id })
      prismaMock.post.update.mockResolvedValueOnce(updated)
      const result = await PostRepository.update(updated.id, {
        content: LEXICAL_EDITOR_JSON,
        description: updated.description,
        title: updated.title,
      })
      expect(result).toBe(updated)
    })
  })
})
