import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { INTERNAL_SERVER_ERROR } from '@/globals/constants'

import { PRISMA_ERROR_CODE_TO_HTTP_STATUS } from '../prisma/constants'
import { PrismaHTTPErrorCodeKey } from '../prisma/errorClasses'

export class PrismaError<
  ErrorType extends PrismaClientKnownRequestError | Error,
> {
  public details: ErrorType

  public status: number

  constructor(details: ErrorType) {
    this.details = details
    this.status = this.computeStatus(details)
  }

  private computeStatus(details: ErrorType) {
    if (!(details instanceof PrismaClientKnownRequestError)) {
      return INTERNAL_SERVER_ERROR
    }

    return (
      PRISMA_ERROR_CODE_TO_HTTP_STATUS[
        details.code as PrismaHTTPErrorCodeKey
      ] ?? INTERNAL_SERVER_ERROR
    )
  }
}
