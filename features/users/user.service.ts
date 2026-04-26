import { errAsync, okAsync } from 'neverthrow'
import { ZodError } from 'zod'

import { CREATED, UNPROCESSABLE_CONTENT } from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'

import type { CreateUserDto } from './dto/create-user.dto'
import { UserRepository } from './user.repository'

export class UserService {
  public static async create(dto: CreateUserDto) {
    const user = await UserRepository.create(dto)
    if (user instanceof PrismaError) {
      return this.respondWithPrismaError(user, 'create')
    }

    if (user instanceof ZodError) {
      return this.respondWithZodError(user, 'create')
    }

    if (user instanceof Error) return this.respondWithError(user)

    const { password, ...publicUser } = user
    void password
    return okAsync({ status: CREATED, user: publicUser } as const)
  }

  private static respondWithError(error: Error) {
    logger.error({ error }, `UserService error:`)
    return errAsync({
      details: error,
      status: UNPROCESSABLE_CONTENT,
      type: 'error' as const,
    } as const)
  }

  private static respondWithPrismaError<Err extends Error>(
    error: PrismaError<Err>,
    method: 'create',
  ) {
    logger.error({ error }, `UserService Prisma error: ${method}`)
    return errAsync({
      details: error.details,
      status: error.status,
      type: 'entity' as const,
    } as const)
  }

  private static respondWithZodError(error: ZodError, method: 'create') {
    logger.error({ error }, `UserService Zod error: ${method}`)
    return errAsync({
      details: error,
      status: UNPROCESSABLE_CONTENT,
      type: 'dto' as const,
    } as const)
  }
}
