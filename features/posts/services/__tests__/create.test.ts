/* eslint-disable neverthrow/must-use-result */
import { faker } from '@faker-js/faker'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { Err, Ok } from 'neverthrow'
import { NextRequest } from 'next/server'
import { ZodError } from 'zod'

import {
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/constants'
import {
  mockUserServerSession,
  mockUserServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

import * as postUtils from '../../utils'
import { CreatePostService } from '..'

afterEach(() => {
  mockUserServerSession('ADMIN')
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('CreatePostService', () => {
  describe('createPost', () => {
    describe('error', () => {
      it('should return an unauthorized status when the jwt is null', async () => {
        mockUserServerSession(null)
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny'),
        )
        const result = await service.createPost()
        expect(result).toEqual(new Err({ status: UNAUTHORIZED }))
      })

      it('should return a forbidden status when the user does not have permission', async () => {
        mockUserServerSession('USER')
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny'),
        )
        const result = await service.createPost()
        expect(result).toEqual(new Err({ status: FORBIDDEN }))
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
          }),
        )
      })

      it('should return the given status and details when a Prisma error that matches a mapped status is thrown', async () => {
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
        // throws foreign key constraint for author id because not authors seeded
        const result = await service.createPost()
        expect(result).toEqual(
          new Err({
            details: expect.any(PrismaClientKnownRequestError),
            status: UNPROCESSABLE_CONTENT,
          }),
        )
      })

      it("should return a 500 status and details when a Prisma error is thrown that doesn't have a matching code", async () => {
        const tryInsertPostSpy = vi
          .spyOn(postUtils, 'tryInsertPost')
          .mockResolvedValueOnce({
            error: new PrismaClientKnownRequestError(
              'Invalid Request Parameters',
              {
                clientVersion: '',
                code: 'P5011',
              },
            ),
            // @ts-expect-error: this matches what would happen if the error
            // occurred
            response: undefined,
          })
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
            details: expect.any(PrismaClientKnownRequestError),
            status: INTERNAL_SERVER_ERROR,
          }),
        )
        tryInsertPostSpy.mockRestore()
      })
    })

    describe('ok', () => {
      setupTestDatabase({ mutatesData: true, withUsers: true })

      it('should return an ok status and the post when the request succeeds', async () => {
        const token = await mockUserServerSessionAsync('ADMIN')
        const title = faker.book.title()
        const service = new CreatePostService(
          new NextRequest('http://nothing.greeny', {
            body: JSON.stringify({ content: {}, publishedAt: null, title }),
            method: 'POST',
          }),
        )
        const result = await service.createPost()
        expect(result).toEqual(
          new Ok({
            post: expect.objectContaining({ authorId: token.id, title }),
            status: SUCCESS,
          }),
        )
      })
    })
  })
})

/* eslint-enable neverthrow/must-use-result */
