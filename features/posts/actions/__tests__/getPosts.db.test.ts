import { errAsync } from 'neverthrow'
import { expect } from 'vitest'

import { PostService } from '@/features/posts/post.service'
import { BAD_REQUEST } from '@/globals/constants'
import { logger } from '@/lib/logger'
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
  it('should return an error for an entity error', async () => {
    const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
    findAndCountSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindAndCountReturn,
    )
    const result = await getPosts({ page: '0' })
    expect(result).toEqual({
      currentPage: null,
      error,
      posts: null,
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
      error,
      posts: null,
      totalPages: null,
    })
  })

  describe('integration', () => {
    setupTestDatabase({ withPosts: true, withUsers: true })

    it('should return posts upon success', async () => {
      const defaultLimit = 10
      const result = (await getPosts({ page: '0' })) as {
        posts: AuthoredPost[]
      }
      expect(result.posts.length).toBe(defaultLimit)
      expect(result).toEqual({
        currentPage: expect.any(Number),
        error: null,
        posts: result.posts.map(() => ({
          author: {
            firstName: expect.any(String),
            lastName: expect.any(String),
          },
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
