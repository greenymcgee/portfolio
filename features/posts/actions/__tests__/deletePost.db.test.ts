import { errAsync } from 'neverthrow'
import { revalidateTag } from 'next/cache'
import mockRouter from 'next-router-mock'

import { PostService } from '@/features/posts/post.service'
import { BAD_REQUEST, CACHE_TAGS, NOT_FOUND, ROUTES } from '@/globals/constants'
import { prisma } from '@/lib/prisma'
import { AUTHORED_POST } from '@/test/fixtures'
import {
  mockServerSession,
  mockServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

import { deletePost } from '..'

type DeleteReturn = Awaited<ReturnType<typeof PostService.delete>>

let deleteSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  mockRouter.push(ROUTES.home)
  deleteSpy = vi.spyOn(PostService, 'delete')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('deletePost', () => {
  describe('unauthorized', () => {
    it('should redirect to the login page when the user is not logged in', async () => {
      await deletePost({ id: AUTHORED_POST.id, status: 'IDLE' })
      expect(mockRouter.pathname).toBe(ROUTES.login)
    })
  })

  describe('authorized', () => {
    it('should prevent a forbidden user from deleting', async () => {
      mockServerSession('USER')
      const result = await deletePost({ id: AUTHORED_POST.id, status: 'IDLE' })
      expect(result).toEqual({
        errorType: 'forbidden',
        id: AUTHORED_POST.id,
        status: 'ERROR',
      })
    })

    it('should return an error status when the dto errors', async () => {
      mockServerSession('ADMIN')
      // @ts-expect-error: for test
      const result = await deletePost({ id: undefined, status: 'IDLE' })
      expect(result).toEqual({
        errorType: 'dto',
        id: undefined,
        status: 'ERROR',
      })
    })

    it('should return an error status when the entity errors', async () => {
      const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
      deleteSpy.mockResolvedValueOnce(
        errAsync(error) as unknown as DeleteReturn,
      )
      const result = await deletePost({ id: AUTHORED_POST.id, status: 'IDLE' })
      expect(result).toEqual({
        errorType: 'entity',
        id: AUTHORED_POST.id,
        status: 'ERROR',
      })
    })

    it('should return an error status for a not-found error', async () => {
      const error = { details: {}, status: NOT_FOUND, type: 'not-found' }
      deleteSpy.mockResolvedValueOnce(
        errAsync(error) as unknown as DeleteReturn,
      )
      const result = await deletePost({ id: AUTHORED_POST.id, status: 'IDLE' })
      expect(result).toEqual({
        errorType: 'not-found',
        id: AUTHORED_POST.id,
        status: 'ERROR',
      })
    })

    it('should return an error status when any unexpected error occur', async () => {
      const error = { details: {}, status: 418 }
      deleteSpy.mockResolvedValueOnce(
        errAsync(error) as unknown as DeleteReturn,
      )
      const result = await deletePost({ id: AUTHORED_POST.id, status: 'IDLE' })
      expect(result).toEqual({
        errorType: 'unhandled',
        id: AUTHORED_POST.id,
        status: 'ERROR',
      })
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withPosts: true, withUsers: true })

    it('should redirect the user upon success', async () => {
      await mockServerSessionAsync('ADMIN')
      const post = await prisma.post.findFirst()
      await deletePost({ id: post?.id as number, status: 'IDLE' })
      expect(mockRouter.pathname).toBe(ROUTES.posts)
    })

    it('should call revalidateTag with posts upon success', async () => {
      await mockServerSessionAsync('ADMIN')
      const post = await prisma.post.findFirst()
      await deletePost({ id: post?.id as number, status: 'IDLE' })
      expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.posts, {})
      expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.post, {})
    })
  })
})
