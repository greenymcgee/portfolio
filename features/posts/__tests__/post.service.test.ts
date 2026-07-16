/* eslint-disable neverthrow/must-use-result */
import { faker } from '@faker-js/faker'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { Err, Ok } from 'neverthrow'
import { ZodError } from 'zod'

import {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  FORBIDDEN,
  NO_CONTENT,
  NOT_FOUND,
  SUCCESS,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { NotFoundError, PrismaError } from '@/lib/errors'
import {
  AUTHORED_POST,
  LEXICAL_EDITOR_JSON,
  POSTS,
  PUBLISHED_POST,
  UNPUBLISHED_POST,
} from '@/test/fixtures'
import { mockServerSession } from '@/test/helpers/utils'

import { FindAndCountPostsDto, FindPostDto } from '../dto'
import { CreatePostDto } from '../dto/create-post.dto'
import { UpdatePostDto } from '../dto/update-post.dto'
import { PostRepository } from '../post.repository'
import { PostService } from '../post.service'

vi.mock('../post.repository', () => ({
  PostRepository: {
    create: vi.fn(),
    delete: vi.fn(),
    findAndCount: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
  },
}))

afterEach(() => {
  vi.resetAllMocks()
  vi.useRealTimers()
})

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
      const dto = new CreatePostDto({ description: 1 as unknown as string })
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

    it('should return an entity error when the dto returns a content validation Error', async () => {
      mockServerSession('ADMIN')
      const dto = new CreatePostDto({
        content: 'no',
        publishedAt: null,
        title: faker.book.title(),
      })
      const result = await PostService.create(dto)
      expect(result).toEqual(
        new Err({
          details: new Error('Post content validation failed'),
          status: BAD_REQUEST,
          type: 'lexical',
        }),
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
      mockServerSession('ADMIN')
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.delete).mockResolvedValueOnce(error)
      const result = await PostService.delete(new FindPostDto({ id: 1 }))
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return an error for an invalid id', async () => {
      mockServerSession('ADMIN')
      const result = await PostService.delete(new FindPostDto({ id: NaN }))
      expect(result).toEqual(
        new Err({
          details: expect.any(ZodError),
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return a NotFoundError returned by the repository', async () => {
      mockServerSession('ADMIN')
      const id = 1
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.delete).mockResolvedValue(error)
      const result = await PostService.delete(new FindPostDto({ id }))
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'not-found' }),
      )
    })

    it('should return the given status upon success', async () => {
      const id = 1
      mockServerSession('ADMIN')
      vi.mocked(PostRepository.delete).mockResolvedValue({ status: NO_CONTENT })
      const result = await PostService.delete(new FindPostDto({ id }))
      expect(result).toEqual(new Ok({ id, status: NO_CONTENT }))
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

    it('should return a DTO error', async () => {
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto({ limit: 'invalid' }),
      )
      expect(result).toEqual(
        new Err({
          details: expect.any(ZodError),
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return posts', async () => {
      vi.mocked(PostRepository.findAndCount).mockResolvedValue({
        currentPage: 5,
        offset: 2,
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
      const result = await PostService.findOne(new FindPostDto({ id: 1 }))
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a not-found PrismaError', async () => {
      const error = new PrismaError(
        new PrismaClientKnownRequestError('Record not found', {
          clientVersion: '',
          code: 'P2025',
        }),
      )
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(error)
      const result = await PostService.findOne(new FindPostDto({ id: 1 }))
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: NOT_FOUND,
          type: 'not-found',
        }),
      )
    })

    it('should return a ZodError', async () => {
      const result = await PostService.findOne(new FindPostDto({ id: 0 }))
      expect(result).toEqual(
        new Err({
          details: expect.any(ZodError),
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return a NotFoundError returned by the repository', async () => {
      const id = 1
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.findOne).mockResolvedValue(error)
      const result = await PostService.findOne(new FindPostDto({ id }))
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'not-found' }),
      )
    })

    it('should return a post', async () => {
      vi.mocked(PostRepository.findOne).mockResolvedValue(AUTHORED_POST)
      const result = await PostService.findOne(new FindPostDto({ id: 1 }))
      expect(result).toEqual(new Ok({ post: AUTHORED_POST, status: SUCCESS }))
    })

    it('should forward the given options to the repository', async () => {
      const options = { include: { author: true } }
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(AUTHORED_POST)
      await PostService.findOne(new FindPostDto({ id: 1 }), options)
      expect(PostRepository.findOne).toHaveBeenCalledWith(1, options)
    })
  })

  describe('togglePublished', () => {
    it('should return unauthorized when there is no session user', async () => {
      mockServerSession(null)
      const result = await PostService.togglePublished(PUBLISHED_POST.id)
      expect(result).toEqual(
        new Err({ status: UNAUTHORIZED, type: 'unauthorized' }),
      )
    })

    it('should return forbidden when the user cannot update posts', async () => {
      mockServerSession('USER')
      const result = await PostService.togglePublished(PUBLISHED_POST.id)
      expect(result).toEqual(new Err({ status: FORBIDDEN, type: 'forbidden' }))
    })

    it('should return a PrismaError returned by findOne', async () => {
      mockServerSession('ADMIN')
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(error)
      const result = await PostService.togglePublished(PUBLISHED_POST.id)
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a NotFoundError returned by findOne', async () => {
      mockServerSession('ADMIN')
      const id = PUBLISHED_POST.id
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(error)
      const result = await PostService.togglePublished(id)
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'not-found' }),
      )
    })

    it('should return a PrismaError returned by update', async () => {
      mockServerSession('ADMIN')
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(AUTHORED_POST)
      vi.mocked(PostRepository.update).mockResolvedValueOnce(error)
      const result = await PostService.togglePublished(AUTHORED_POST.id)
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a NotFoundError returned by the repository', async () => {
      mockServerSession('ADMIN')
      const id = PUBLISHED_POST.id
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(AUTHORED_POST)
      vi.mocked(PostRepository.update).mockResolvedValueOnce(error)
      const result = await PostService.togglePublished(AUTHORED_POST.id)
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'not-found' }),
      )
    })

    describe('publish success', () => {
      it('should set the publishedAt date to now', async () => {
        const now = new Date()
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(now)
        mockServerSession('ADMIN')
        vi.mocked(PostRepository.findOne).mockResolvedValueOnce(
          UNPUBLISHED_POST as AuthoredPost,
        )
        vi.mocked(PostRepository.update).mockResolvedValueOnce(UNPUBLISHED_POST)
        const result = await PostService.togglePublished(UNPUBLISHED_POST.id)
        expect(result).toEqual(
          new Ok({ post: UNPUBLISHED_POST, status: SUCCESS }),
        )
        expect(PostRepository.update).toHaveBeenCalledWith(
          UNPUBLISHED_POST.id,
          { publishedAt: now },
        )
      })
    })

    describe('unpublish success', () => {
      it('should set the publishedAt date to null', async () => {
        const now = new Date()
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(now)
        mockServerSession('ADMIN')
        vi.mocked(PostRepository.findOne).mockResolvedValueOnce(AUTHORED_POST)
        vi.mocked(PostRepository.update).mockResolvedValueOnce(AUTHORED_POST)
        const result = await PostService.togglePublished(AUTHORED_POST.id)
        expect(result).toEqual(new Ok({ post: AUTHORED_POST, status: SUCCESS }))
        expect(PostRepository.update).toHaveBeenCalledWith(AUTHORED_POST.id, {
          publishedAt: null,
        })
      })
    })
  })

  describe('update', () => {
    it('should return unauthorized when there is no session user', async () => {
      mockServerSession(null)
      const dto = new UpdatePostDto({ title: faker.book.title() })
      const result = await PostService.update(PUBLISHED_POST.id, dto)
      expect(result).toEqual(
        new Err({ status: UNAUTHORIZED, type: 'unauthorized' }),
      )
    })

    it('should return forbidden when the user cannot update posts', async () => {
      mockServerSession('USER')
      const dto = new UpdatePostDto({ title: faker.book.title() })
      const result = await PostService.update(PUBLISHED_POST.id, dto)
      expect(result).toEqual(new Err({ status: FORBIDDEN, type: 'forbidden' }))
    })

    it('should return a dto error when params fail validation', async () => {
      mockServerSession('ADMIN')
      // @ts-expect-error: we need to test
      const dto = new UpdatePostDto({ title: 1 })
      const result = await PostService.update(PUBLISHED_POST.id, dto)
      expect(result).toEqual(
        new Err({
          details: expect.any(ZodError),
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return a unique constraint error when the repository returns a unique violation', async () => {
      mockServerSession('ADMIN')
      const prismaError = new PrismaError(
        new PrismaClientKnownRequestError('Unique constraint failed', {
          clientVersion: '',
          code: 'P2002',
        }),
      )
      vi.mocked(PostRepository.update).mockResolvedValueOnce(prismaError)
      const dto = new UpdatePostDto({
        content: LEXICAL_EDITOR_JSON,
        description: PUBLISHED_POST.description,
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(PUBLISHED_POST.id, dto)
      expect(result).toEqual(
        new Err({
          details: prismaError,
          status: CONFLICT,
          type: 'unique-constraint',
        }),
      )
    })

    it('should return a PrismaError provided by the repository', async () => {
      mockServerSession('ADMIN')
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.update).mockResolvedValueOnce(error)
      const dto = new UpdatePostDto({
        content: LEXICAL_EDITOR_JSON,
        description: PUBLISHED_POST.description,
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(PUBLISHED_POST.id, dto)
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a NotFoundError returned by the repository', async () => {
      mockServerSession('ADMIN')
      const id = PUBLISHED_POST.id
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.update).mockResolvedValueOnce(error)
      const dto = new UpdatePostDto({
        content: LEXICAL_EDITOR_JSON,
        description: PUBLISHED_POST.description,
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(id, dto)
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'not-found' }),
      )
    })

    it('should return a lexical error when the dto returns a content validation Error', async () => {
      mockServerSession('ADMIN')
      const dto = new UpdatePostDto({
        content: 'invalid',
        description: PUBLISHED_POST.description,
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(PUBLISHED_POST.id, dto)
      expect(result).toEqual(
        new Err({
          details: new Error('Post content validation failed'),
          status: BAD_REQUEST,
          type: 'lexical',
        }),
      )
    })

    it('should return success when the repository returns a post', async () => {
      mockServerSession('ADMIN')
      vi.mocked(PostRepository.update).mockResolvedValueOnce(PUBLISHED_POST)
      const dto = new UpdatePostDto({
        content: LEXICAL_EDITOR_JSON,
        description: PUBLISHED_POST.description,
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(PUBLISHED_POST.id, dto)
      expect(result).toEqual(new Ok({ post: PUBLISHED_POST, status: SUCCESS }))
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
