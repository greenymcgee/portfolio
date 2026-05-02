import { faker } from '@faker-js/faker'
import { errAsync } from 'neverthrow'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  BAD_REQUEST,
  CACHE_TAGS,
  INTERNAL_SERVER_ERROR,
  ROUTES,
} from '@/globals/constants'
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

const FORM_DATA = new FormData()
FORM_DATA.set('description', faker.lorem.word())
FORM_DATA.set('publishedAt', faker.date.future().toISOString())
FORM_DATA.set('title', faker.book.title())

describe('createPost', () => {
  it('should return a Zod validation error', async () => {
    mockServerSession('ADMIN')
    const formData = new FormData()
    formData.set('invalid', 'anything')
    const result = await createPost({ status: 'IDLE' }, formData)
    expect(result).toEqual({
      error: expect.objectContaining({
        fieldErrors: expect.any(Object),
        formErrors: expect.any(Array),
      }),
      status: 'ERROR',
    })
  })

  it('should redirect to the login page when a user is not logged in', async () => {
    await createPost({ status: 'IDLE' }, FORM_DATA)
    expect(redirect).toHaveBeenCalledWith(
      ROUTES.loginWithRedirect(ROUTES.newPost),
    )
  })

  it('should redirect to the home page when the response is forbidden', async () => {
    mockServerSession('USER')
    await createPost({ status: 'IDLE' }, FORM_DATA)
    expect(redirect).toHaveBeenCalledWith(ROUTES.home)
  })

  it('should return the error status and the previous state when a lexical error occurs', async () => {
    mockServerSession('ADMIN')
    createSpy.mockImplementationOnce(() => {
      return errAsync({
        details: new Error('Lexical error'),
        status: BAD_REQUEST,
        type: 'lexical',
      })
    })
    const state: CreatePostState = {
      ...Object.fromEntries(FORM_DATA),
      status: 'IDLE',
    }
    const result = await createPost(state, FORM_DATA)
    expect(result).toEqual({
      content: state.content,
      description: state.description,
      publishedAt: state.publishedAt,
      status: 'ERROR',
      title: state.title,
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
    const state: CreatePostState = {
      ...Object.fromEntries(FORM_DATA),
      status: 'IDLE',
    }
    const result = await createPost(state, FORM_DATA)
    expect(result).toEqual({
      content: state.content,
      description: state.description,
      publishedAt: state.publishedAt,
      status: 'ERROR',
      title: state.title,
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withUsers: true })

    it('should redirect to the post page upon success', async () => {
      await mockServerSessionAsync('ADMIN')
      await createPost({ status: 'IDLE' }, FORM_DATA)
      const post = await prisma.post.findFirst({
        where: { title: FORM_DATA.get('title') as string },
      })
      expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.posts, {})
      expect(redirect).toHaveBeenCalledWith(ROUTES.post(post?.id as number))
    })
  })
})
