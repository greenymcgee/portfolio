import { errAsync } from 'neverthrow'
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import mockRouter from 'next-router-mock'

import { PostService } from '@/features/posts/post.service'
import {
  BAD_REQUEST,
  CACHE_TAGS,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  ROUTES,
} from '@/globals/constants'
import { prisma } from '@/lib/prisma'
import { Post } from '@/prisma/generated/client'
import {
  mockServerSession,
  mockServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

import { TogglePostPublishedState } from '../../types'
import { togglePostPublished } from '..'

type ToggleReturn = Awaited<ReturnType<typeof PostService.togglePublished>>

let toggleSpy: ReturnType<typeof vi.spyOn>
const ID = 1

beforeEach(() => {
  mockRouter.push(ROUTES.post(ID))
  toggleSpy = vi.spyOn(PostService, 'togglePublished')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

const STATE: TogglePostPublishedState = {
  id: ID,
  publishedAt: undefined,
  status: 'IDLE',
}

describe('togglePostPublished', () => {
  describe('unauthorized', () => {
    it('should redirect to the login page when the user is not logged in', async () => {
      await togglePostPublished(STATE)
      expect(redirect).toHaveBeenCalledWith(
        ROUTES.loginWithRedirect(ROUTES.post(STATE.id)),
      )
    })
  })

  describe('authorized', () => {
    it('should return an error state when the user does not have permission', async () => {
      mockServerSession('USER')
      await togglePostPublished(STATE)
      expect(redirect).toHaveBeenCalledWith(ROUTES.home)
    })

    it('should return an error state for an entity error', async () => {
      mockServerSession('ADMIN')
      toggleSpy.mockImplementationOnce(
        () =>
          errAsync({
            details: {},
            status: BAD_REQUEST,
            type: 'entity',
          }) as unknown as ToggleReturn,
      )
      const result = await togglePostPublished(STATE)
      expect(result).toEqual({
        errorType: 'entity',
        id: STATE.id,
        status: 'ERROR',
      })
    })

    it('should return an error state for a not-found error', async () => {
      mockServerSession('ADMIN')
      toggleSpy.mockImplementationOnce(
        () =>
          errAsync({
            details: {},
            status: NOT_FOUND,
            type: 'not-found',
          }) as unknown as ToggleReturn,
      )
      const result = await togglePostPublished(STATE)
      expect(result).toEqual({
        errorType: 'not-found',
        id: STATE.id,
        status: 'ERROR',
      })
    })

    it('should return an error state for any unexpected errors', async () => {
      mockServerSession('ADMIN')
      toggleSpy.mockImplementationOnce(
        () =>
          errAsync({
            details: {},
            status: INTERNAL_SERVER_ERROR,
            type: 'totally-unexpected',
          }) as unknown as ToggleReturn,
      )
      const result = await togglePostPublished(STATE)
      expect(result).toEqual({
        errorType: 'unhandled',
        id: STATE.id,
        status: 'ERROR',
      })
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withPosts: true, withUsers: true })

    it('should redirect to the post page upon publish success', async () => {
      await mockServerSessionAsync('ADMIN')
      const post = (await prisma.post.findFirst({
        where: { publishedAt: null },
      })) as Post
      await togglePostPublished({
        id: post.id,
        publishedAt: undefined,
        status: 'IDLE',
      })
      expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.post(post.id))
      expect(redirect).toHaveBeenCalledWith(ROUTES.post(post.id))
    })

    it('should return a success state upon unpublish success', async () => {
      await mockServerSessionAsync('ADMIN')
      const post = (await prisma.post.findFirst()) as Post
      const result = await togglePostPublished({
        id: post.id,
        publishedAt: undefined,
        status: 'IDLE',
      })
      expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.post(post.id))
      expect(result).toEqual({
        id: post.id,
        publishedAt: null,
        status: 'SUCCESS',
      })
    })
  })
})
