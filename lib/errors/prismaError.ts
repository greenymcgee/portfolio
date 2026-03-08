import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { INTERNAL_SERVER_ERROR } from '@/globals/constants'

import { PRISMA_ERROR_CODE_TO_HTTP_STATUS } from '../prisma/constants'
import { PrismaHTTPErrorCodeKey } from '../prisma/errorClasses'

export class PrismaError<
  ErrorType extends PrismaClientKnownRequestError | Error,
> {
  public details: ErrorType

  constructor(details: ErrorType) {
    this.details = details
  }

  public get status() {
    const { details } = this
    if (!details || !(details instanceof PrismaClientKnownRequestError)) {
      return INTERNAL_SERVER_ERROR
    }

    const status =
      PRISMA_ERROR_CODE_TO_HTTP_STATUS[details.code as PrismaHTTPErrorCodeKey]
    return status ?? INTERNAL_SERVER_ERROR
  }
}
