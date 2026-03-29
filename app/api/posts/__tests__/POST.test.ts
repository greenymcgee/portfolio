/* eslint-disable neverthrow/must-use-result */
import { errAsync, okAsync } from 'neverthrow'

import { PostService } from '@/features/posts/post.service'
import {
  CREATED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { createResponse } from '@/lib/db'
import { PrismaError } from '@/lib/errors'
import { postFactory } from '@/test/factories'
import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'
import { mockServerSession } from '@/test/helpers/utils'

import { POST } from '../route'

let createSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  createSpy = vi.spyOn(PostService, 'create') as ReturnType<typeof vi.spyOn>
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('POST:/api/posts/', () => {
  describe('unauthorized', () => {
    it('should return an unauthorized response when no user is logged in', async () => {
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(result.status).toEqual(UNAUTHORIZED)
    })
  })

  describe('authorized', () => {
    it('should return a forbidden response when a non-admin user is logged in', async () => {
      mockServerSession('USER')
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(result.status).toEqual(FORBIDDEN)
    })

    it('should return an entity error when provided', async () => {
      mockServerSession('ADMIN')
      const error = new PrismaError(new Error('Bad'))
      const url = new URL('http://nothing.greeny/posts')
      createSpy.mockResolvedValueOnce(
        errAsync({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
      const result = await POST(new Request(url))
      expect(result).toEqual(
        createResponse({
          body: { type: 'entity' },
          status: error.status,
          url: url.toString(),
        }),
      )
    })

    it('should return a dto error when provided', async () => {
      mockServerSession('ADMIN')
      const url = new URL('http://nothing.greeny/posts')
      const params = {
        publishedAt: null,
        title: 123,
      }
      const result = await POST(
        new Request(url, { body: JSON.stringify(params), method: 'POST' }),
      )
      expect(result).toEqual(
        createResponse({
          body: { type: 'dto' },
          status: UNPROCESSABLE_CONTENT,
          url: url.toString(),
        }),
      )
    })

    it('should return an internal server error response for any unexpected errors', async () => {
      mockServerSession('ADMIN')
      const url = new URL('http://nothing.greeny/posts')
      const error = { details: {}, status: 418 }
      createSpy.mockResolvedValueOnce(errAsync({ error }))
      const result = await POST(new Request(url))
      expect(result).toEqual(
        createResponse({ status: INTERNAL_SERVER_ERROR, url: url.toString() }),
      )
    })

    it('should return a success response with the post for a valid request', async () => {
      const url = new URL('http://nothing.greeny/posts')
      const params = {
        content: LEXICAL_EDITOR_JSON,
        publishedAt: null,
        title: 'Hello',
      }
      const { user } = mockServerSession('ADMIN')
      const post = postFactory
        .associations({ authorId: user?.id })
        .build(params)
      createSpy.mockResolvedValueOnce(okAsync({ post, status: CREATED }))
      const result = await POST(
        new Request(url, {
          body: JSON.stringify(params),
          method: 'POST',
        }),
      )
      expect(result).toEqual(
        createResponse({
          body: { post },
          status: CREATED,
          url: url.toString(),
        }),
      )
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
