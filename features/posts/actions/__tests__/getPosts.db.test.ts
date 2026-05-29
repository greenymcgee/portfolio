import { errAsync } from 'neverthrow'
import { redirect } from 'next/navigation'
import { expect } from 'vitest'
import { flattenError, ZodError } from 'zod'

import { PostService } from '@/features/posts/post.service'
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  ROUTES,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { logger } from '@/lib/logger'
import { Post } from '@/prisma/generated/client'
import { setupTestDatabase } from '@/test/helpers/utils'

import { getPosts } from '..'

type FindAndCountReturn = Awaited<ReturnType<typeof PostService.findAndCount>>

let findAndCountSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  findAndCountSpy = vi.spyOn(PostService, 'findAndCount')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getPosts', () => {
  it('should return a flattened error for a DTO error', async () => {
    const error = {
      details: new ZodError([]),
      status: UNPROCESSABLE_CONTENT,
      type: 'dto',
    }
    findAndCountSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindAndCountReturn,
    )
    const result = await getPosts({ page: '0' })
    expect(result).toEqual({
      currentPage: null,
      error: flattenError(error.details),
      errorType: error.type,
      posts: null,
      status: error.status,
      totalPages: null,
    })
  })

  it('should return an error for an entity error', async () => {
    const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
    findAndCountSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindAndCountReturn,
    )
    const result = await getPosts({ page: '0' })
    expect(result).toEqual({
      currentPage: null,
      errorType: error.type,
      posts: null,
      status: error.status,
      totalPages: null,
    })
  })

  it('should return an error for a not-found error', async () => {
    const error = { details: {}, status: NOT_FOUND, type: 'not-found' }
    findAndCountSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindAndCountReturn,
    )
    const result = await getPosts({ page: '0' })
    expect(result).toEqual({
      currentPage: null,
      errorType: error.type,
      posts: null,
      status: error.status,
      totalPages: null,
    })
  })

  it('should require authorization for unpublished posts', async () => {
    await getPosts({ unpublished: 'true' })
    expect(redirect).toHaveBeenCalledWith(
      ROUTES.loginWithRedirect(ROUTES.unpublishedPosts),
    )
  })

  it('should return the auth Zod error when the unpublished param is invalid', async () => {
    const result = await getPosts({ unpublished: 'not-a-bool' })
    expect(result).toEqual({
      currentPage: null,
      error: { fieldErrors: expect.any(Object), formErrors: expect.any(Array) },
      errorType: 'auth-zod',
      posts: null,
      status: UNPROCESSABLE_CONTENT,
      totalPages: null,
    })
  })

  it('should log and return an error for unhandled error types', async () => {
    const error = { details: {}, status: 418 }
    findAndCountSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindAndCountReturn,
    )
    const result = await getPosts({ page: '0' })
    expect(logger.error).toHaveBeenCalledWith(
      { error },
      'UNHANDLED_FIND_AND_COUNT_POSTS_ERROR',
    )
    expect(result).toEqual({
      currentPage: null,
      errorType: 'unhandled',
      posts: null,
      status: INTERNAL_SERVER_ERROR,
      totalPages: null,
    })
  })

  describe('integration', () => {
    setupTestDatabase({ withPosts: true, withUsers: true })

    it('should return posts upon success', async () => {
      const defaultLimit = 10
      const result = (await getPosts({ page: '0' })) as { posts: Post[] }
      expect(result.posts.length).toBe(defaultLimit)
      expect(result).toEqual({
        currentPage: expect.any(Number),
        errorType: null,
        posts: result.posts.map(() => ({
          authorId: expect.any(String),
          content: expect.any(String),
          createdAt: expect.any(Date),
          description: expect.any(String),
          id: expect.any(Number),
          publishedAt: expect.toBeOneOf([null, expect.any(Date)]),
          title: expect.any(String),
          updatedAt: expect.any(Date),
        })),
        totalPages: expect.any(Number),
      })
    })
  })
})
