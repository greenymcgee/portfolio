import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { PRISMA_ERROR_CODE_TO_HTTP_STATUS } from '../constants'
import { getPrismaErrorHTTPStatus } from '../getPrismaErrorHTTPStatus'

const FOUR_HUNDREDS = Object.entries(PRISMA_ERROR_CODE_TO_HTTP_STATUS).reduce(
  (prev, [key, value]) => {
    if (value === 400) return { ...prev, [key]: value }

    return prev
  },
  {},
)

const FOUR_0_FOURS = Object.entries(PRISMA_ERROR_CODE_TO_HTTP_STATUS).reduce(
  (prev, [key, value]) => {
    if (value === 404) return { ...prev, [key]: value }

    return prev
  },
  {},
)

const FOUR_0_NINES = Object.entries(PRISMA_ERROR_CODE_TO_HTTP_STATUS).reduce(
  (prev, [key, value]) => {
    if (value === 409) return { ...prev, [key]: value }

    return prev
  },
  {},
)

const FOUR_TWENTY_TWOS = Object.entries(
  PRISMA_ERROR_CODE_TO_HTTP_STATUS,
).reduce((prev, [key, value]) => {
  if (value === 422) return { ...prev, [key]: value }

  return prev
}, {})

function createError(code: string) {
  return new PrismaClientKnownRequestError('test', {
    batchRequestIdx: 0,
    clientVersion: 'version',
    code,
  })
}

describe('getPrismaErrorHTTPStatus', () => {
  it.each(Object.keys(FOUR_HUNDREDS))(
    'should return a 400 for any codes matching in the map',
    (code) => {
      const result = getPrismaErrorHTTPStatus(createError(code))
      expect(result).toBe(400)
    },
  )

  it.each(Object.keys(FOUR_0_FOURS))(
    'should return 404 for any codes matching in the map',
    (code) => {
      const result = getPrismaErrorHTTPStatus(createError(code))
      expect(result).toBe(404)
    },
  )

  it.each(Object.keys(FOUR_0_NINES))(
    'should return 409 for any codes matching in the map',
    (code) => {
      const result = getPrismaErrorHTTPStatus(createError(code))
      expect(result).toBe(409)
    },
  )

  it.each(Object.keys(FOUR_TWENTY_TWOS))(
    'should return 422 for any codes matching in the map',
    (code) => {
      const result = getPrismaErrorHTTPStatus(createError(code))
      expect(result).toBe(422)
    },
  )

  it('should return null for an unmapped code', () => {
    const result = getPrismaErrorHTTPStatus(createError('123'))
    expect(result).toBeNull()
  })
})
