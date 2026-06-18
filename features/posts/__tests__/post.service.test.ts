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
import { TogglePostPublishedDto } from '../dto/toggle-post-published.dto'
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
  })

  describe('togglePublished', () => {
    it('should return unauthorized when there is no session user', async () => {
      mockServerSession(null)
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.sentence(),
        id: String(PUBLISHED_POST.id),
        publishedAt: null,
        title: faker.book.title(),
      })
      const result = await PostService.togglePublished(dto)
      expect(result).toEqual(
        new Err({ status: UNAUTHORIZED, type: 'unauthorized' }),
      )
    })

    it('should return forbidden when the user cannot update posts', async () => {
      mockServerSession('USER')
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.sentence(),
        id: String(PUBLISHED_POST.id),
        publishedAt: null,
        title: faker.book.title(),
      })
      const result = await PostService.togglePublished(dto)
      expect(result).toEqual(new Err({ status: FORBIDDEN, type: 'forbidden' }))
    })

    it('should return a dto error when params fail validation', async () => {
      mockServerSession('ADMIN')
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.sentence(),
        id: String(PUBLISHED_POST.id),
        publishedAt: null,
        title: '',
      })
      const result = await PostService.togglePublished(dto)
      expect(result).toEqual(
        new Err({
          details: expect.any(ZodError),
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return a lexical error when the dto returns a content validation Error', async () => {
      mockServerSession('ADMIN')
      const dto = new TogglePostPublishedDto({
        content: 'invalid',
        description: faker.lorem.sentence(),
        id: String(PUBLISHED_POST.id),
        publishedAt: '',
        title: faker.book.title(),
      })
      const result = await PostService.togglePublished(dto)
      expect(result).toEqual(
        new Err({
          details: new Error('Post content validation failed'),
          status: BAD_REQUEST,
          type: 'lexical',
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
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.sentence(),
        id: String(PUBLISHED_POST.id),
        publishedAt: '',
        title: faker.book.title(),
      })
      const result = await PostService.togglePublished(dto)
      expect(result).toEqual(
        new Err({
          details: prismaError,
          status: CONFLICT,
          type: 'unique-constraint',
        }),
      )
    })

    it('should return a NotFoundError returned by the repository', async () => {
      mockServerSession('ADMIN')
      const id = PUBLISHED_POST.id
      const error = new NotFoundError(id, 'Post')
      vi.mocked(PostRepository.update).mockResolvedValueOnce(error)
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.sentence(),
        id: String(PUBLISHED_POST.id),
        publishedAt: '',
        title: faker.book.title(),
      })
      const result = await PostService.togglePublished(dto)
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
        vi.mocked(PostRepository.update).mockResolvedValueOnce(UNPUBLISHED_POST)
        const params = {
          content: LEXICAL_EDITOR_JSON,
          description: faker.lorem.sentence(),
          id: String(UNPUBLISHED_POST.id),
          publishedAt: '',
          title: faker.book.title(),
        } as const
        const dto = new TogglePostPublishedDto(params)
        const result = await PostService.togglePublished(dto)
        expect(result).toEqual(
          new Ok({ post: UNPUBLISHED_POST, status: SUCCESS }),
        )
        expect(PostRepository.update).toHaveBeenCalledWith(
          UNPUBLISHED_POST.id,
          {
            content: params.content,
            description: params.description,
            publishedAt: now,
            title: params.title,
          },
        )
      })
    })

    describe('unpublish success', () => {
      it('should set the publishedAt date to null', async () => {
        const now = new Date()
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(now)
        mockServerSession('ADMIN')
        vi.mocked(PostRepository.update).mockResolvedValueOnce(PUBLISHED_POST)
        const params = {
          content: LEXICAL_EDITOR_JSON,
          description: faker.lorem.sentence(),
          id: String(PUBLISHED_POST.id),
          publishedAt: faker.date.past().toISOString(),
          title: faker.book.title(),
        } as const
        const dto = new TogglePostPublishedDto(params)
        const result = await PostService.togglePublished(dto)
        expect(result).toEqual(
          new Ok({ post: PUBLISHED_POST, status: SUCCESS }),
        )
        expect(PostRepository.update).toHaveBeenCalledWith(PUBLISHED_POST.id, {
          content: params.content,
          description: params.description,
          publishedAt: null,
          title: params.title,
        })
      })
    })
  })

  describe('update', () => {
    it('should return unauthorized when there is no session user', async () => {
      mockServerSession(null)
      const dto = new UpdatePostDto({
        id: String(PUBLISHED_POST.id),
        title: faker.book.title(),
      })
      const result = await PostService.update(dto)
      expect(result).toEqual(
        new Err({ status: UNAUTHORIZED, type: 'unauthorized' }),
      )
    })

    it('should return forbidden when the user cannot update posts', async () => {
      mockServerSession('USER')
      const dto = new UpdatePostDto({
        id: String(PUBLISHED_POST.id),
        title: faker.book.title(),
      })
      const result = await PostService.update(dto)
      expect(result).toEqual(new Err({ status: FORBIDDEN, type: 'forbidden' }))
    })

    it('should return a dto error when params fail validation', async () => {
      mockServerSession('ADMIN')
      const dto = new UpdatePostDto({
        id: String(PUBLISHED_POST.id),
        title: faker.book.title(),
      })
      const result = await PostService.update(dto)
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
        id: String(PUBLISHED_POST.id),
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(dto)
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
        id: String(PUBLISHED_POST.id),
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(dto)
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
        id: String(id),
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(dto)
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'not-found' }),
      )
    })

    it('should return a lexical error when the dto returns a content validation Error', async () => {
      mockServerSession('ADMIN')
      const dto = new UpdatePostDto({
        content: 'invalid',
        description: PUBLISHED_POST.description,
        id: String(PUBLISHED_POST.id),
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(dto)
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
        id: String(PUBLISHED_POST.id),
        title: PUBLISHED_POST.title,
      })
      const result = await PostService.update(dto)
      expect(result).toEqual(new Ok({ post: PUBLISHED_POST, status: SUCCESS }))
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
