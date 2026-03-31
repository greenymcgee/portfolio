/* eslint-disable neverthrow/must-use-result */
import { faker } from '@faker-js/faker'
import { Err, Ok } from 'neverthrow'
import { ZodError } from 'zod'

import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  HTTP_TEXT_BY_STATUS,
  NOT_FOUND,
  SUCCESS,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { PrismaError, RequestJSONError } from '@/lib/errors'
import { LEXICAL_EDITOR_JSON, POSTS, PUBLISHED_POST } from '@/test/fixtures'
import { mockServerSession } from '@/test/helpers/utils'

import { FindAndCountPostsDto, FindPostDto } from '../dto'
import { CreatePostDto } from '../dto/create-post.dto'
import { PostRepository } from '../post.repository'
import { PostService } from '../post.service'

vi.mock('../post.repository', () => ({
  PostRepository: { create: vi.fn(), findAndCount: vi.fn(), findOne: vi.fn() },
}))

describe('PostService', () => {
  describe('create', () => {
    it('should return unauthorized when there is no session user', async () => {
      const dto = new CreatePostDto(
        new Request('http://greeny.no/posts', { body: '{}', method: 'POST' }),
      )
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({ status: UNAUTHORIZED, type: 'unauthorized' }),
      )
    })

    it('should return forbidden when the user cannot create posts', async () => {
      mockServerSession('USER')
      const dto = new CreatePostDto(
        new Request('http://greeny.no/posts', { body: '{}', method: 'POST' }),
      )
      const result = await PostService.create(dto)
      expect(result).toEqual(new Err({ status: FORBIDDEN, type: 'forbidden' }))
    })

    it('should return a dto error when JSON is invalid', async () => {
      mockServerSession('ADMIN')
      vi.mocked(PostRepository.create).mockResolvedValueOnce(
        new RequestJSONError(new Error('bad')),
      )
      const dto = new CreatePostDto(
        new Request('http://greeny.no/posts', { body: '{', method: 'POST' }),
      )
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({
          details: expect.any(RequestJSONError),
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return a dto error when params fail validation', async () => {
      mockServerSession('ADMIN')
      const dto = new CreatePostDto(
        new Request('http://greeny.no/posts', { body: '{}', method: 'POST' }),
      )
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
      const dto = new CreatePostDto(
        new Request('http://greeny.no/posts', {
          body: JSON.stringify({
            content: LEXICAL_EDITOR_JSON,
            publishedAt: null,
            title: faker.book.title(),
          }),
          method: 'POST',
        }),
      )
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
      const dto = new CreatePostDto(
        new Request('http://greeny.no/posts', {
          body: JSON.stringify({
            content: LEXICAL_EDITOR_JSON,
            publishedAt: null,
            title: faker.book.title(),
          }),
          method: 'POST',
        }),
      )
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({ details: error, status: BAD_REQUEST, type: 'entity' }),
      )
    })

    it('should return created when the repository returns a post', async () => {
      mockServerSession('ADMIN')
      vi.mocked(PostRepository.create).mockResolvedValueOnce(PUBLISHED_POST)
      const dto = new CreatePostDto(
        new Request('http://greeny.no/posts', {
          body: JSON.stringify({
            content: LEXICAL_EDITOR_JSON,
            publishedAt: null,
            title: 'Title',
          }),
          method: 'POST',
        }),
      )
      const result = await PostService.create(dto)
      expect(result).toEqual(new Ok({ post: PUBLISHED_POST, status: CREATED }))
    })
  })

  describe('findAndCount', () => {
    it('should return a PrismaError', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findAndCount).mockResolvedValueOnce(error)
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto(new Request('http://green.no/posts')),
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
        new FindAndCountPostsDto(
          new Request('http://greeny.no/posts?limit="invalid'),
        ),
      )
      expect(result).toEqual(
        new Err({ details: error, status: UNPROCESSABLE_CONTENT, type: 'dto' }),
      )
    })

    it('should return posts', async () => {
      vi.mocked(PostRepository.findAndCount).mockResolvedValue({
        // @ts-expect-error: the author isn't important for this test
        posts: POSTS,
        totalPages: 22,
      })
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto(new Request('http://greeny.no/posts')),
      )
      expect(result).toEqual(
        new Ok({ posts: POSTS, status: SUCCESS, totalPages: 22 }),
      )
    })
  })

  describe('findOne', () => {
    it('should return a PrismaError', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(error)
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
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
      vi.mocked(PostRepository.findOne).mockResolvedValue(
        error as ZodError<number>,
      )
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(
        new Err({ details: error, status: UNPROCESSABLE_CONTENT, type: 'dto' }),
      )
    })

    it('should return a not found error', async () => {
      const error = new Error(HTTP_TEXT_BY_STATUS[NOT_FOUND], {
        cause: { status: NOT_FOUND },
      })
      vi.mocked(PostRepository.findOne).mockResolvedValue(error)
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'entity' }),
      )
    })

    it('should return a post', async () => {
      // @ts-expect-error: the author isn't important for this test
      vi.mocked(PostRepository.findOne).mockResolvedValue(PUBLISHED_POST)
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(new Ok({ post: PUBLISHED_POST, status: SUCCESS }))
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
