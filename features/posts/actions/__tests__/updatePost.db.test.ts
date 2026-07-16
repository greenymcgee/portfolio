import { faker } from '@faker-js/faker'
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

import { UpdatePostState } from '../../types'
import { updatePost } from '..'

type UpdateReturn = Awaited<ReturnType<typeof PostService.update>>

let updateSpy: ReturnType<typeof vi.spyOn>
const ID = 1

beforeEach(() => {
  mockRouter.push(ROUTES.post(ID))
  updateSpy = vi.spyOn(PostService, 'update')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

const STATE: UpdatePostState = { id: ID, status: 'IDLE' }

const FORM_DATA = new FormData()
FORM_DATA.set('description', faker.lorem.word())
FORM_DATA.set('title', faker.book.title())

describe('updatePost', () => {
  describe('unauthorized', () => {
    it('should redirect to the login page when the user is not logged in', async () => {
      await updatePost(STATE, FORM_DATA)
      expect(redirect).toHaveBeenCalledWith(
        ROUTES.loginWithRedirect(ROUTES.post(ID)),
      )
    })
  })

  describe('authorized', () => {
    it('should return an error state when the user does not have permission', async () => {
      mockServerSession('USER')
      await updatePost(STATE, FORM_DATA)
      expect(redirect).toHaveBeenCalledWith(ROUTES.home)
    })

    it('should return an error state when the dto errors', async () => {
      mockServerSession('ADMIN')
      const formData = new FormData()
      formData.set('invalid', 'anything')
      const result = await updatePost(STATE, formData)
      expect(result).toEqual({
        ...Object.fromEntries(formData),
        dtoError: {
          fieldErrors: expect.any(Object),
          formErrors: expect.any(Array),
        },
        errorType: 'dto',
        id: ID,
        status: 'ERROR',
      })
    })

    it('should return an error state for a lexical error', async () => {
      mockServerSession('ADMIN')
      updateSpy.mockImplementationOnce(() =>
        errAsync({
          details: new Error('Lexical error'),
          status: BAD_REQUEST,
          type: 'lexical',
        }),
      )
      const result = await updatePost(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'lexical',
        id: ID,
        status: 'ERROR',
      })
    })

    it('should return an error state for an entity error', async () => {
      mockServerSession('ADMIN')
      updateSpy.mockImplementationOnce(
        () =>
          errAsync({
            details: {},
            status: BAD_REQUEST,
            type: 'entity',
          }) as unknown as UpdateReturn,
      )
      const result = await updatePost(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'entity',
        id: STATE.id,
        status: 'ERROR',
      })
    })

    it('should return an error state for a not-found error', async () => {
      mockServerSession('ADMIN')
      updateSpy.mockImplementationOnce(
        () =>
          errAsync({
            details: {},
            status: NOT_FOUND,
            type: 'not-found',
          }) as unknown as UpdateReturn,
      )
      const result = await updatePost(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'not-found',
        id: STATE.id,
        status: 'ERROR',
      })
    })

    it('should return an error state for any unexpected errors', async () => {
      mockServerSession('ADMIN')
      updateSpy.mockImplementationOnce(
        () =>
          errAsync({
            details: {},
            status: INTERNAL_SERVER_ERROR,
            type: 'totally-unexpected',
          }) as unknown as UpdateReturn,
      )
      const result = await updatePost(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'unhandled',
        id: STATE.id,
        status: 'ERROR',
      })
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withPosts: true, withUsers: true })

    it('should return a success state upon success', async () => {
      await mockServerSessionAsync('ADMIN')
      const title = faker.book.title()
      const description = faker.lorem.sentence()
      const post = (await prisma.post.findFirst()) as Post
      const formData = new FormData()
      formData.set('content', '')
      formData.set('description', description)
      formData.set('title', title)
      const result = await updatePost({ id: post.id, status: 'IDLE' }, formData)
      const updatedPost = (await prisma.post.findFirst({
        where: { id: post.id },
      })) as Post
      expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.post(post.id))
      expect(updatedPost.title).toEqual(title)
      expect(result).toEqual({
        content: '',
        description,
        id: post.id,
        status: 'SUCCESS',
        title,
      })
    })

    it('should return a unique constraint error state when a title is taken', async () => {
      await mockServerSessionAsync('ADMIN')
      const posts = await prisma.post.findMany({ take: 2 })
      const [postOne, postTwo] = posts
      const formData = new FormData()
      formData.set('content', String(postOne.content))
      formData.set('description', String(postOne.description))
      formData.set('title', postTwo.title as string)
      const result = await updatePost(
        { id: postOne.id, status: 'IDLE' },
        formData,
      )
      expect(result).toEqual({
        content: postOne.content,
        description: postOne.description,
        errorType: 'unique-constraint',
        id: postOne.id,
        status: 'ERROR',
        threwUniqueConstraintError: true,
        title: postTwo.title,
      })
    })
  })
})
