import { errAsync } from 'neverthrow'
import { getServerSession } from 'next-auth/next'

import * as postServices from '@/features/posts/services'
import {
  CREATED,
  FORBIDDEN,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'
import { mockServerSessionAsync, setupTestDatabase } from '@/test/helpers/utils'

import { POST } from '../route'

beforeEach(() => {
  vi.mocked(getServerSession).mockResolvedValue(null)
})

describe('POST:/api/posts/', () => {
  describe('unauthorized', () => {
    it('should return an unauthorized response when no user is logged in', async () => {
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(result.status).toEqual(UNAUTHORIZED)
    })
  })

  describe('authorized', () => {
    setupTestDatabase({ withUsers: true })

    it('should return a forbidden response when a non-admin user is logged in', async () => {
      await mockServerSessionAsync('USER')
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(result.status).toEqual(FORBIDDEN)
    })

    it('should return an expected response for any of the errors containing details', async () => {
      await mockServerSessionAsync('ADMIN')
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(result.status).toEqual(UNPROCESSABLE_CONTENT)
    })

    it('should return an unprocessable content response when a zod error occurs', async () => {
      await mockServerSessionAsync('ADMIN')
      const params = {
        publishedAt: null,
        title: 123,
      }
      const result = await POST(
        new Request(new URL('http://nothing.greeny'), {
          body: JSON.stringify(params),
          method: 'POST',
        }),
      )
      expect(result.status).toEqual(UNPROCESSABLE_CONTENT)
    })

    it('should return an internal server error response for any unexpected errors', async () => {
      await mockServerSessionAsync('ADMIN')
      const error = { details: {}, status: 418 }
      vi.spyOn(postServices, 'CreatePostService').mockImplementationOnce(
        class {
          createPost = () => errAsync(error)
        } as unknown as typeof postServices.CreatePostService,
      )
      const result = await POST(new Request(new URL('http://nothing.greeny')))
      expect(result.status).toEqual(INTERNAL_SERVER_ERROR)
      vi.restoreAllMocks()
    })

    it('should return a success response with the post for a valid request', async () => {
      const { user } = await mockServerSessionAsync('ADMIN')
      const params = {
        content: LEXICAL_EDITOR_JSON,
        publishedAt: null,
        title: 'Hello',
      }
      const result = await POST(
        new Request(new URL('http://nothing.greeny'), {
          body: JSON.stringify(params),
          method: 'POST',
        }),
      )
      const json = await result.json()
      expect(json).toEqual({
        message: HTTP_TEXT_BY_STATUS[CREATED],
        post: expect.objectContaining({
          ...params,
          authorId: user.id,
        }),
      })
      expect(result.status).toEqual(CREATED)
    })
  })
})
