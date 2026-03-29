import { errAsync } from 'neverthrow'
import { expect } from 'vitest'

import { PostService } from '@/features/posts/post.service'
import {
  BAD_REQUEST,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { POSTS } from '@/test/fixtures'
import { setupTestDatabase } from '@/test/helpers/utils'

import { GET } from '../route'

type FindAndCountReturn = Awaited<ReturnType<typeof PostService.findAndCount>>

let findAndCountSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  findAndCountSpy = vi.spyOn(PostService, 'findAndCount')
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('GET:/api/posts/', () => {
  it('should return an expected response for invalid params', async () => {
    const params = new URLSearchParams()
    params.append('page', 'page not a number')
    params.append('limit', 'limit not a number')
    const url = new URL(`http://nothing.greeny?${params}`)
    const result = await GET(new Request(url))
    expect(await result.json()).toEqual({
      message: HTTP_TEXT_BY_STATUS[UNPROCESSABLE_CONTENT],
      type: 'dto',
    })
  })

  it('should return an expect response for an entity error', async () => {
    const url = new URL('http://nothing.greeny')
    const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
    findAndCountSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindAndCountReturn,
    )
    const result = await GET(new Request(url))
    expect(await result.json()).toEqual({
      message: HTTP_TEXT_BY_STATUS[BAD_REQUEST],
      type: 'entity',
    })
  })

  it('should return an internal server error response for any unexpected errors', async () => {
    const url = new URL('http://nothing.greeny')
    const error = { details: {}, status: 418 }
    findAndCountSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindAndCountReturn,
    )
    const result = await GET(new Request(url))
    expect(await result.json()).toEqual({
      message: HTTP_TEXT_BY_STATUS[INTERNAL_SERVER_ERROR],
    })
  })

  describe('integration', () => {
    setupTestDatabase({ withPosts: true, withUsers: true })

    it('should return a success response with the posts for a valid request', async () => {
      const defaultLimit = 10
      const request = new Request(new URL('http://nothing.greeny/api/posts'))
      const result = await GET(request)
      const json = await result.json()
      expect(json.posts.length).toBe(defaultLimit)
      expect(json).toEqual({
        message: HTTP_TEXT_BY_STATUS[SUCCESS],
        posts: json.posts.map(() => ({
          author: {
            firstName: expect.any(String),
            lastName: expect.any(String),
          },
          authorId: expect.any(String),
          content: expect.any(String),
          createdAt: expect.any(String),
          id: expect.any(Number),
          publishedAt: expect.toBeOneOf([null, expect.any(String)]),
          title: expect.any(String),
          updatedAt: expect.any(String),
        })),
        totalPages: Math.ceil(POSTS.length / defaultLimit),
      })
    })
  })
})
