import { errAsync } from 'neverthrow'

import {
  CREATED,
  FORBIDDEN,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/constants'
import * as postServices from '@/features/posts/services'
import { mockServerSessionAsync, setupTestDatabase } from '@/test/helpers/utils'

import { POST } from '../route'

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

    it('should return an internal server error response for any unexpected errors', async () => {
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
        content: { h1: 'Hello' },
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
        post: expect.objectContaining({ ...params, authorId: user.id }),
      })
      expect(result.status).toEqual(CREATED)
    })
  })
})
