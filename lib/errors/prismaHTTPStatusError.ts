import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { PrismaErrorHTTPStatus } from '@/types/prisma'

/**
 * Used to catch PrismaClientKnownRequestErrors that are mapped to
 * PrismaErrorHTTPStatus.
 */
export class PrismaHTTPStatusError {
  public details: PrismaClientKnownRequestError

  public status: PrismaErrorHTTPStatus

  constructor(
    status: PrismaErrorHTTPStatus,
    details: PrismaClientKnownRequestError,
  ) {
    this.details = details
    this.status = status
  }
}
