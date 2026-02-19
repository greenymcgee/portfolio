import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { PRISMA_ERROR_CODE_TO_HTTP_STATUS } from './constants'
import { PrismaHTTPErrorCodeKey } from './errorClasses'

export function getPrismaErrorHTTPStatus(
  error: PrismaClientKnownRequestError | null | undefined,
): 400 | 404 | 409 | 422 | null {
  if (!error) return null

  const status =
    PRISMA_ERROR_CODE_TO_HTTP_STATUS[error.code as PrismaHTTPErrorCodeKey]
  return status ?? null
}
