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
import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'
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

const STATE: TogglePostPublishedState = { status: 'IDLE' }

const FORM_DATA = new FormData()
FORM_DATA.set('content', LEXICAL_EDITOR_JSON)
FORM_DATA.set('description', faker.lorem.word())
FORM_DATA.set('id', String(ID))
FORM_DATA.set('publishedAt', '')
FORM_DATA.set('title', faker.book.title())

describe('togglePostPublished', () => {
  describe('unauthorized', () => {
    it('should redirect to the login page when the user is not logged in', async () => {
      await togglePostPublished(STATE, FORM_DATA)
      expect(redirect).toHaveBeenCalledWith(
        ROUTES.loginWithRedirect(ROUTES.post(Number(FORM_DATA.get('id')))),
      )
    })
  })

  describe('authorized', () => {
    it('should return an error state when the user does not have permission', async () => {
      mockServerSession('USER')
      await togglePostPublished(STATE, FORM_DATA)
      expect(redirect).toHaveBeenCalledWith(ROUTES.home)
    })

    it('should return an error state when the dto errors', async () => {
      mockServerSession('ADMIN')
      const formData = new FormData()
      formData.set('invalid', 'anything')
      const result = await togglePostPublished(STATE, formData)
      expect(result).toEqual({
        ...Object.fromEntries(formData),
        dtoError: {
          fieldErrors: expect.any(Object),
          formErrors: expect.any(Array),
        },
        errorType: 'dto',
        status: 'ERROR',
      })
    })

    it('should return an error state for a lexical error', async () => {
      mockServerSession('ADMIN')
      toggleSpy.mockImplementationOnce(() =>
        errAsync({
          details: new Error('Lexical error'),
          status: BAD_REQUEST,
          type: 'lexical',
        }),
      )
      const result = await togglePostPublished(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'lexical',
        status: 'ERROR',
      })
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
      const result = await togglePostPublished(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'entity',
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
      const result = await togglePostPublished(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'not-found',
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
      const result = await togglePostPublished(STATE, FORM_DATA)
      expect(result).toEqual({
        ...Object.fromEntries(FORM_DATA),
        errorType: 'unhandled',
        status: 'ERROR',
      })
    })
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withPosts: true, withUsers: true })

    it('should redirect to the post page upon publish success', async () => {
      await mockServerSessionAsync('ADMIN')
      const title = faker.book.title()
      const description = faker.lorem.sentence()
      const post = (await prisma.post.findFirst()) as Post
      const id = String(post.id)
      const formData = new FormData()
      formData.set('content', LEXICAL_EDITOR_JSON)
      formData.set('description', description)
      formData.set('id', id)
      formData.set('publishedAt', '')
      formData.set('title', title)
      await togglePostPublished({ status: 'IDLE' }, formData)
      expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.post(post.id))
      expect(redirect).toHaveBeenCalledWith(ROUTES.post(post.id))
    })

    it('should return a success state upon unpublish success', async () => {
      await mockServerSessionAsync('ADMIN')
      const title = faker.book.title()
      const description = faker.lorem.sentence()
      const post = (await prisma.post.findFirst()) as Post
      const id = String(post.id)
      const formData = new FormData()
      formData.set('content', LEXICAL_EDITOR_JSON)
      formData.set('description', description)
      formData.set('id', id)
      formData.set('publishedAt', new Date().toISOString())
      formData.set('title', title)
      const result = await togglePostPublished({ status: 'IDLE' }, formData)
      expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.post(post.id))
      expect(result).toEqual({
        content: LEXICAL_EDITOR_JSON,
        description,
        id,
        publishedAt: null,
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
      formData.set('id', String(postOne.id))
      formData.set('publishedAt', '')
      formData.set('title', postTwo.title as string)
      const result = await togglePostPublished({ status: 'IDLE' }, formData)
      expect(result).toEqual({
        content: postOne.content,
        description: postOne.description,
        errorType: 'unique-constraint',
        id: String(postOne.id),
        publishedAt: '',
        status: 'ERROR',
        threwUniqueConstraintError: true,
        title: postTwo.title,
      })
    })
  })
})
