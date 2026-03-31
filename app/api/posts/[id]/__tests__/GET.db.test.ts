import { errAsync } from 'neverthrow'

import { PostService } from '@/features/posts/post.service'
import {
  BAD_REQUEST,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { createResponse } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { setupTestDatabase } from '@/test/helpers/utils'

import { GET } from '../route'

type FindOneReturn = Awaited<ReturnType<typeof PostService.findOne>>

let findOneSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  findOneSpy = vi.spyOn(PostService, 'findOne')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET:/api/posts/[id]', () => {
  it('should return an bad request response for an invalid id', async () => {
    const url = new URL('http://nothing.greeny/posts')
    const result = await GET(new Request(url), {
      params: Promise.resolve({ id: 'invalid' }),
    })
    expect(await result.json()).toEqual({
      message: HTTP_TEXT_BY_STATUS[UNPROCESSABLE_CONTENT],
      type: 'dto',
    })
  })

  it('should return an expected status for an entity error', async () => {
    const url = new URL('http://nothing.greeny')
    const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
    findOneSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindOneReturn,
    )
    const result = await GET(new Request(url), {
      params: Promise.resolve({ id: '1' }),
    })
    expect(await result.json()).toEqual({
      message: HTTP_TEXT_BY_STATUS[BAD_REQUEST],
      type: 'entity',
    })
  })

  it('should return an internal server error response for any unexpected errors', async () => {
    const url = new URL('http://nothing.greeny')
    const error = { details: {}, status: 418 }
    findOneSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindOneReturn,
    )
    const result = await GET(new Request(url), {
      params: Promise.resolve({ id: '1' }),
    })
    expect(result).toEqual(
      createResponse({ status: INTERNAL_SERVER_ERROR, url: url.toString() }),
    )
  })

  describe('integration', () => {
    setupTestDatabase({ withPosts: true, withUsers: true })

    it('should return a success response with the post for a valid request', async () => {
      const request = new Request(new URL('http://nothing.greeny/api/posts'))
      const post = await prisma.post.findFirst()
      const author = await prisma.user.findFirst({
        where: { id: post?.authorId },
      })
      const result = await GET(request, {
        params: Promise.resolve({ id: String(post?.id) }),
      })
      const json = await result.json()
      expect(json).toEqual({
        message: HTTP_TEXT_BY_STATUS[SUCCESS],
        post: {
          author: { firstName: author?.firstName, lastName: author?.lastName },
          authorId: post?.authorId,
          content: post?.content,
          createdAt: post?.createdAt.toISOString(),
          id: post?.id,
          publishedAt: post?.publishedAt?.toISOString(),
          title: post?.title,
          updatedAt: post?.updatedAt.toISOString(),
        },
      })
    })
  })
})
