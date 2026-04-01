import { errAsync } from 'neverthrow'

import { PostService } from '@/features/posts/post.service'
import {
  BAD_REQUEST,
  FORBIDDEN,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  NO_CONTENT,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { createResponse } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import {
  getApiUrl,
  mockServerSession,
  mockServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

import { DELETE } from '../route'

type DeleteReturn = Awaited<ReturnType<typeof PostService.delete>>

let deleteSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  deleteSpy = vi.spyOn(PostService, 'delete')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DELETE:/api/posts/[id]', () => {
  describe('unauthorized', () => {
    it('should return an unauthorized response when no user is logged in', async () => {
      const id = 1
      const result = await DELETE(new Request(getApiUrl('post', [id])), {
        params: Promise.resolve({ id: String(id) }),
      })
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[UNAUTHORIZED],
        type: 'unauthorized',
      })
    })
  })

  describe('authorized', () => {
    it('should return a forbidden response when a non-admin user is logged in', async () => {
      const id = 1
      mockServerSession('USER')
      const result = await DELETE(new Request(getApiUrl('post', [id])), {
        params: Promise.resolve({ id: String(id) }),
      })
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[FORBIDDEN],
        type: 'forbidden',
      })
    })

    it('should return an unprocessable content response for an invalid id', async () => {
      mockServerSession('ADMIN')
      const id = undefined
      const url = new URL(getApiUrl('post', [id as unknown as number]))
      const result = await DELETE(new Request(url), {
        params: Promise.resolve({ id: String(id) }),
      })
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[UNPROCESSABLE_CONTENT],
        type: 'dto',
      })
    })

    it('should return an expected status for an entity error', async () => {
      const id = 1
      const url = new URL(getApiUrl('post', [id]))
      const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
      deleteSpy.mockResolvedValueOnce(
        errAsync(error) as unknown as DeleteReturn,
      )
      const result = await DELETE(new Request(url), {
        params: Promise.resolve({ id: String(id) }),
      })
      expect(await result.json()).toEqual({
        message: HTTP_TEXT_BY_STATUS[BAD_REQUEST],
        type: 'entity',
      })
    })

    it('should return an internal server error response for any unexpected errors', async () => {
      const id = 1
      const url = new URL(getApiUrl('post', [id]))
      const error = { details: {}, status: 418 }
      deleteSpy.mockResolvedValueOnce(
        errAsync(error) as unknown as DeleteReturn,
      )
      const result = await DELETE(new Request(url), {
        params: Promise.resolve({ id: String(id) }),
      })
      expect(result).toEqual(
        createResponse({ status: INTERNAL_SERVER_ERROR, url: url.toString() }),
      )
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withPosts: true, withUsers: true })

    it('should return a no content response with the post for a valid request', async () => {
      await mockServerSessionAsync('ADMIN')
      const post = await prisma.post.findFirst()
      const id = post?.id
      const request = new Request(new URL(getApiUrl('post', [id as number])))
      const result = await DELETE(request, {
        params: Promise.resolve({ id: String(id) }),
      })
      expect(result.status).toEqual(NO_CONTENT)
    })
  })
})
