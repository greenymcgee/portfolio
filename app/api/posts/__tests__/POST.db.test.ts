/* eslint-disable neverthrow/must-use-result */
import { faker } from '@faker-js/faker'
import { errAsync } from 'neverthrow'

import { PostService } from '@/features/posts/post.service'
import {
  CREATED,
  FORBIDDEN,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { postFactory } from '@/test/factories'
import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'
import {
  mockServerSession,
  mockServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

import { POST } from '../route'

let createSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  createSpy = vi.spyOn(PostService, 'create') as ReturnType<typeof vi.spyOn>
})

afterEach(() => {
  createSpy.mockRestore()
})

describe('POST:/api/posts/', () => {
  describe('unauthorized', () => {
    it('should return an unauthorized response when no user is logged in', async () => {
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[UNAUTHORIZED],
      })
    })
  })

  describe('authorized', () => {
    it('should return a forbidden response when a non-admin user is logged in', async () => {
      mockServerSession('USER')
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[FORBIDDEN],
      })
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
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[error.status],
        type: 'entity',
      })
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
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[UNPROCESSABLE_CONTENT],
        type: 'dto',
      })
    })

    it('should return an internal server error response for any unexpected errors', async () => {
      mockServerSession('ADMIN')
      const url = new URL('http://nothing.greeny/posts')
      const error = { details: {}, status: 418 }
      createSpy.mockResolvedValueOnce(errAsync({ error }))
      const result = await POST(new Request(url))
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[INTERNAL_SERVER_ERROR],
      })
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withPosts: true, withUsers: true })

    it('should return a success response with the post for a valid request', async () => {
      const url = new URL('http://nothing.greeny/posts')
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        publishedAt: new Date(),
        title: faker.book.title(),
      }
      const { user } = await mockServerSessionAsync('ADMIN')
      const post = postFactory.associations({ authorId: user.id }).build(params)
      const result = await POST(
        new Request(url, {
          body: JSON.stringify(params),
          method: 'POST',
        }),
      )
      const json = await result.json()
      expect(json).toEqual({
        message: HTTP_TEXT_BY_STATUS[CREATED],
        post: {
          authorId: user.id,
          content: post.content,
          createdAt: expect.any(String),
          description: params.description,
          id: expect.any(Number),
          publishedAt: post.publishedAt?.toISOString(),
          title: post.title,
          updatedAt: expect.any(String),
        },
      })
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
