/* eslint-disable neverthrow/must-use-result */
import { faker } from '@faker-js/faker'
import { Err, Ok } from 'neverthrow'
import { ZodError } from 'zod'

import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NO_CONTENT,
  NOT_FOUND,
  SUCCESS,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { NotFoundError, PrismaError } from '@/lib/errors'
import { LEXICAL_EDITOR_JSON, POSTS, PUBLISHED_POST } from '@/test/fixtures'
import { mockServerSession } from '@/test/helpers/utils'

import { FindAndCountPostsDto, FindPostDto } from '../dto'
import { CreatePostDto } from '../dto/create-post.dto'
import { PostRepository } from '../post.repository'
import { PostService } from '../post.service'

vi.mock('../post.repository', () => ({
  PostRepository: {
    create: vi.fn(),
    delete: vi.fn(),
    findAndCount: vi.fn(),
    findOne: vi.fn(),
  },
}))

describe('PostService', () => {
  describe('create', () => {
    it('should return unauthorized when there is no session user', async () => {
      const dto = new CreatePostDto({})
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({ status: UNAUTHORIZED, type: 'unauthorized' }),
      )
    })

    it('should return forbidden when the user cannot create posts', async () => {
      mockServerSession('USER')
      const dto = new CreatePostDto({})
      const result = await PostService.create(dto)
      expect(result).toEqual(new Err({ status: FORBIDDEN, type: 'forbidden' }))
    })

    it('should return a dto error when params fail validation', async () => {
      mockServerSession('ADMIN')
      const dto = new CreatePostDto({})
      vi.mocked(PostRepository.create).mockResolvedValueOnce(new ZodError([]))
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({
          details: expect.any(ZodError),
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return a PrismaError provided by the repository', async () => {
      mockServerSession('ADMIN')
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.create).mockResolvedValueOnce(error)
      const dto = new CreatePostDto({
        content: LEXICAL_EDITOR_JSON,
        publishedAt: null,
        title: faker.book.title(),
      })
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return an entity error when the repository returns a validation Error', async () => {
      mockServerSession('ADMIN')
      const error = new Error('Post content validation failed')
      vi.mocked(PostRepository.create).mockResolvedValueOnce(error)
      const dto = new CreatePostDto({
        content: LEXICAL_EDITOR_JSON,
        publishedAt: null,
        title: faker.book.title(),
      })
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({ details: error, status: BAD_REQUEST, type: 'lexical' }),
      )
    })

    it('should return created when the repository returns a post', async () => {
      mockServerSession('ADMIN')
      vi.mocked(PostRepository.create).mockResolvedValueOnce(PUBLISHED_POST)
      const dto = new CreatePostDto({
        content: LEXICAL_EDITOR_JSON,
        publishedAt: null,
        title: 'Title',
      })
      const result = await PostService.create(dto)
      expect(result).toEqual(new Ok({ post: PUBLISHED_POST, status: CREATED }))
    })
  })

  describe('delete', () => {
    it('should return a PrismaError returned by the repository', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.delete).mockResolvedValueOnce(error)
      const result = await PostService.delete(new FindPostDto(1))
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a ZodError returned by the repository', async () => {
      const error = new ZodError([])
      vi.mocked(PostRepository.delete).mockResolvedValue(
        error as ZodError<number>,
      )
      const result = await PostService.delete(new FindPostDto(NaN))
      expect(result).toEqual(
        new Err({ details: error, status: UNPROCESSABLE_CONTENT, type: 'dto' }),
      )
    })

    it('should return a NotFoundError returned by the repository', async () => {
      const id = 1
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.delete).mockResolvedValue(error)
      const result = await PostService.delete(new FindPostDto(id))
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'entity' }),
      )
    })

    it('should return the given status upon success', async () => {
      vi.mocked(PostRepository.delete).mockResolvedValue({ status: NO_CONTENT })
      const result = await PostService.delete(new FindPostDto(1))
      expect(result).toEqual(new Ok({ status: NO_CONTENT }))
    })
  })

  describe('findAndCount', () => {
    it('should return a PrismaError', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findAndCount).mockResolvedValueOnce(error)
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto({}),
      )
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a ZodError', async () => {
      const error = new ZodError([])
      vi.mocked(PostRepository.findAndCount).mockResolvedValue(error)
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto({ limit: 'invalid' }),
      )
      expect(result).toEqual(
        new Err({ details: error, status: UNPROCESSABLE_CONTENT, type: 'dto' }),
      )
    })

    it('should return posts', async () => {
      vi.mocked(PostRepository.findAndCount).mockResolvedValue({
        currentPage: 5,
        // @ts-expect-error: the author isn't important for this test
        posts: POSTS,
        totalPages: 22,
      })
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto({}),
      )
      expect(result).toEqual(
        new Ok({
          currentPage: 5,
          posts: POSTS,
          status: SUCCESS,
          totalPages: 22,
        }),
      )
    })
  })

  describe('findOne', () => {
    it('should return a PrismaError', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(error)
      const result = await PostService.findOne(new FindPostDto(1))
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a ZodError', async () => {
      const error = new ZodError([])
      vi.mocked(PostRepository.findOne).mockResolvedValue(
        error as ZodError<number>,
      )
      const result = await PostService.findOne(new FindPostDto(1))
      expect(result).toEqual(
        new Err({ details: error, status: UNPROCESSABLE_CONTENT, type: 'dto' }),
      )
    })

    it('should return a NotFoundError returned by the repository', async () => {
      const id = 1
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.findOne).mockResolvedValue(error)
      const result = await PostService.findOne(new FindPostDto(id))
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'entity' }),
      )
    })

    it('should return a post', async () => {
      // @ts-expect-error: the author isn't important for this test
      vi.mocked(PostRepository.findOne).mockResolvedValue(PUBLISHED_POST)
      const result = await PostService.findOne(new FindPostDto(1))
      expect(result).toEqual(new Ok({ post: PUBLISHED_POST, status: SUCCESS }))
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
