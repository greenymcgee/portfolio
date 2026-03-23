/* eslint-disable neverthrow/must-use-result */
import { faker } from '@faker-js/faker'
import { Err, Ok } from 'neverthrow'
import { NextRequest } from 'next/server'
import { ZodError } from 'zod'

import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'
import {
  mockServerSession,
  mockServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

import * as postUtils from '../../utils'
import { CreatePostService } from '..'

afterEach(() => {
  mockServerSession('ADMIN')
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('CreatePostService', () => {
  describe('createPost', () => {
    describe('error', () => {
      it('should return an unauthorized status when the jwt is null', async () => {
        mockServerSession(null)
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny'),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Err({ status: UNAUTHORIZED, type: 'unauthorized' }),
        )
      })

      it('should return a forbidden status when the user does not have permission', async () => {
        mockServerSession('USER')
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny'),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Err({ status: FORBIDDEN, type: 'forbidden' }),
        )
      })

      it('should return an unprocessable content status and details when zod throws an error', async () => {
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny', {
            body: JSON.stringify({ content: {}, publishedAt: null, title: '' }),
            method: 'POST',
          }),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Err({
            details: expect.any(ZodError),
            status: UNPROCESSABLE_CONTENT,
            type: 'zod',
          }),
        )
      })

      it('should return an unprocessable content status and details when the request.json is invalid JSON', async () => {
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny', {
            body: JSON.stringify(undefined),
            method: 'POST',
          }),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Err({
            details: {
              error: new SyntaxError('Unexpected end of JSON input'),
              message: 'JSON not parsable',
            },
            status: UNPROCESSABLE_CONTENT,
            type: 'json',
          }),
        )
      })

      it('should return an error when the insert fails', async () => {
        const error = new PrismaError(new Error('Bad'))
        const tryInsertPostSpy = vi
          .spyOn(postUtils, 'tryInsertPost')
          .mockResolvedValueOnce(error)
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny', {
            body: JSON.stringify({
              content: {},
              publishedAt: null,
              title: faker.book.title(),
            }),
            method: 'POST',
          }),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Err({
            details: error.details,
            status: error.status,
            type: 'insert',
          }),
        )
        tryInsertPostSpy.mockRestore()
      })

      it('should return a bad request status when tryInsertPost returns a validation error', async () => {
        const validationError = new Error('Post content validation failed')
        const tryInsertPostSpy = vi
          .spyOn(postUtils, 'tryInsertPost')
          .mockResolvedValueOnce(validationError)
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny', {
            body: JSON.stringify({
              content: LEXICAL_EDITOR_JSON,
              publishedAt: null,
              title: faker.book.title(),
            }),
            method: 'POST',
          }),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Err({
            details: validationError,
            status: BAD_REQUEST,
            type: 'insert',
          }),
        )
        tryInsertPostSpy.mockRestore()
      })
    })

    describe('ok', () => {
      setupTestDatabase({ mutatesData: true, withUsers: true })

      it('should return an ok status and the post when the request succeeds', async () => {
        const { token } = await mockServerSessionAsync('ADMIN')
        const title = faker.book.title()
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny', {
            body: JSON.stringify({
              content: LEXICAL_EDITOR_JSON,
              publishedAt: null,
              title,
            }),
            method: 'POST',
          }),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Ok({
            post: expect.objectContaining({ authorId: token.id, title }),
            status: CREATED,
          }),
        )
      })
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
