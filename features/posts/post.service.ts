import { errAsync, okAsync } from 'neverthrow'
import { Session } from 'next-auth'
import { ZodError } from 'zod'

import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  SUCCESS,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { authenticateAPISession } from '@/lib/auth'
import { PrismaError, RequestJSONError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { hasPermission } from '@/lib/permissions'

import type { CreatePostDto } from './dto/create-post.dto'
import type { FindAndCountPostsDto } from './dto/find-and-count-posts.dto'
import type { FindPostDto } from './dto/find-post.dto'
import { PostRepository } from './post.repository'

export class PostService {
  public static async create(dto: CreatePostDto) {
    const user = await authenticateAPISession()
    if (user === null) return this.respondWithUnauthorizedError()

    const authorizedUser = this.authorizeUser(user)
    if (authorizedUser === null) return this.respondWithForbiddenError()

    const post = await PostRepository.create(dto, user)
    if (post instanceof PrismaError) {
      return this.respondWithPrismaError(post, 'create')
    }

    if (post instanceof RequestJSONError) {
      return this.respondWithJSONError(post, 'create')
    }

    if (post instanceof ZodError) {
      return this.respondWithZodError(post, 'create')
    }

    if (post instanceof Error) {
      return errAsync({
        details: post,
        status: BAD_REQUEST,
        type: 'entity',
      } as const)
    }

    return okAsync({ post, status: CREATED } as const)
  }

  public static async findAndCount(dto: FindAndCountPostsDto) {
    const response = await PostRepository.findAndCount(dto)
    if (response instanceof PrismaError) {
      return PostService.respondWithPrismaError(response, 'findAndCount')
    }

    if (response instanceof ZodError) {
      return PostService.respondWithZodError(response, 'findAndCount')
    }

    return okAsync({
      posts: response.posts,
      status: SUCCESS,
      totalPages: response.totalPages,
    } as const)
  }

  public static async findOne(dto: FindPostDto) {
    const post = await PostRepository.findOne(dto)
    if (post instanceof PrismaError) {
      return PostService.respondWithPrismaError(post, 'findOne')
    }

    if (post instanceof ZodError) {
      return PostService.respondWithZodError(post, 'findOne')
    }

    if (post instanceof Error) {
      return PostService.respondWithNotFoundError(post)
    }

    return okAsync({ post, status: SUCCESS } as const)
  }

  private static authorizeUser(user: Session['user']) {
    if (hasPermission(user, 'posts', 'create')) return user

    logger.error({ userId: user.id }, 'PostService auth error:')
    return null
  }

  private static respondWithForbiddenError() {
    return errAsync({
      status: FORBIDDEN,
      type: 'forbidden' as const,
    } as const)
  }

  private static respondWithNotFoundError(error: Error) {
    logger.error({ error }, 'PostService not found error:')
    const { cause } = error as Error & { cause: { status: typeof NOT_FOUND } }
    return errAsync({
      details: error,
      status: cause.status,
      type: 'entity' as const,
    } as const)
  }

  private static respondWithPrismaError<Err extends Error>(
    error: PrismaError<Err>,
    method: 'create' | 'findAndCount' | 'findOne',
  ) {
    logger.error({ error }, `PostService Prisma error: ${method}`)
    return errAsync({
      details: error.details,
      status: error.status,
      type: 'entity' as const,
    } as const)
  }

  private static respondWithUnauthorizedError() {
    return errAsync({
      status: UNAUTHORIZED,
      type: 'unauthorized' as const,
    } as const)
  }

  private static respondWithJSONError(
    error: RequestJSONError,
    method: 'create',
  ) {
    logger.error({ error }, `PostService RequestJSONError error: ${method}`)
    return errAsync({
      details: error,
      status: error.status,
      type: 'dto' as const,
    } as const)
  }

  private static respondWithZodError(
    error: ZodError,
    method: 'create' | 'findAndCount' | 'findOne',
  ) {
    logger.error({ error }, `PostService Zod error: ${method}`)
    return errAsync({
      details: error,
      status: UNPROCESSABLE_CONTENT,
      type: 'dto' as const,
    } as const)
  }
}
