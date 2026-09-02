import { errAsync } from 'neverthrow'
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  CACHE_TAGS,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  ROUTES,
} from '@/globals/constants'
import { NotFoundError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import {
  mockServerSession,
  mockServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

import { PostService } from '../../post.service'
import { CreatePostState } from '../../types'
import { createPost } from '..'

let createSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  createSpy = vi.spyOn(PostService, 'create')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

describe('createPost', () => {
  it('should redirect to the login page when a user is not logged in', async () => {
    await createPost({ status: 'IDLE' })
    expect(redirect).toHaveBeenCalledWith(ROUTES.login)
  })

  it('should redirect to the home page when the response is forbidden', async () => {
    mockServerSession('USER')
    await createPost({ status: 'IDLE' })
    expect(redirect).toHaveBeenCalledWith(ROUTES.home)
  })

  it('should return the error status and the previous state when a not-found error occurs', async () => {
    mockServerSession('ADMIN')
    createSpy.mockImplementationOnce(() => {
      return errAsync({
        details: new NotFoundError('1', 'Post'),
        status: NOT_FOUND,
        type: 'not-found',
      })
    })
    const result = await createPost({ status: 'IDLE' })
    expect(result).toEqual({
      errorType: 'not-found',
      status: 'ERROR',
    })
  })

  it('should return the error status and the previous state when an unknown error occurs', async () => {
    mockServerSession('ADMIN')
    createSpy.mockImplementationOnce(() => {
      return errAsync({
        details: new Error('unexpected'),
        status: INTERNAL_SERVER_ERROR,
        type: 'totally-unexpected',
      })
    })
    const state: CreatePostState = { status: 'IDLE' }
    const result = await createPost(state)
    expect(result).toEqual({
      errorType: 'unhandled',
      status: 'ERROR',
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withUsers: true })

    it('should redirect to the edit post page upon success', async () => {
      await mockServerSessionAsync('ADMIN')
      await createPost({ status: 'IDLE' })
      const posts = await prisma.post.findMany()
      const post = posts[posts.length - 1]
      expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.posts)
      expect(redirect).toHaveBeenCalledWith(ROUTES.editPost(post!.id))
    })
  })
})
