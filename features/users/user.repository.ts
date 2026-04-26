import { tryCatch } from '@greenymcgee/typescript-utils'
import bcrypt from 'bcryptjs'
import { ZodError } from 'zod'

import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

import type { CreateUserDto } from './dto/create-user.dto'

const SALT_ROUNDS = 10

export class UserRepository {
  public static async create(dto: CreateUserDto) {
    const { params } = dto
    if (params instanceof ZodError) return params

    const { error: hashError, response: password } = await tryCatch(
      bcrypt.hash(params.password, SALT_ROUNDS),
    )
    if (hashError) {
      logger.error({ error: hashError }, 'UserRepository password hash error:')
      return hashError
    }

    const { error, response: user } = await tryCatch(
      prisma.user.create({
        data: {
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          password,
          username: params.username,
        },
      }),
    )
    if (error) {
      const prismaError = new PrismaError(error)
      logger.error(
        { details: prismaError.details, status: prismaError.status },
        'UserRepository Prisma error:',
      )
      return prismaError
    }

    return user
  }
}
