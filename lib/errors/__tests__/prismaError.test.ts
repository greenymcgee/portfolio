import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { INTERNAL_SERVER_ERROR } from '@/constants'
import { PRISMA_ERROR_CODE_TO_HTTP_STATUS } from '@/lib/prisma/constants'

import { PrismaError } from '..'

describe('PrismaError', () => {
  describe('status', () => {
    it('should return 500 for an unknown error', () => {
      const error = new PrismaError(new Error('nothing'))
      expect(error.status).toBe(INTERNAL_SERVER_ERROR)
    })

    it('should return 500 for an unknown Prisma error', () => {
      const error = new PrismaError(
        new PrismaClientKnownRequestError('nothing', {
          clientVersion: '',
          code: '123',
        }),
      )
      expect(error.status).toBe(INTERNAL_SERVER_ERROR)
    })

    it('should return the status for a known error', () => {
      const code = Object.keys(PRISMA_ERROR_CODE_TO_HTTP_STATUS).at(
        0,
      ) as keyof typeof PRISMA_ERROR_CODE_TO_HTTP_STATUS
      const error = new PrismaError(
        new PrismaClientKnownRequestError('nothing', {
          clientVersion: '',
          code,
        }),
      )
      expect(error.status).toBe(PRISMA_ERROR_CODE_TO_HTTP_STATUS[code])
    })
  })
})
