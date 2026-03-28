import { errAsync, okAsync } from 'neverthrow'
import { ZodError } from 'zod'

import { BAD_REQUEST, NOT_FOUND, SUCCESS } from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'

import type { FindAndCountPostsDto } from './dto/find-and-count-posts.dto'
import type { FindPostDto } from './dto/find-post.dto'
import { PostRepository } from './post.repository'

export class PostService {
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
    method: 'findAndCount' | 'findOne',
  ) {
    logger.error({ error }, `PostService Prisma error: ${method}`)
    return errAsync({
      details: error.details,
      status: error.status,
      type: 'entity' as const,
    } as const)
  }

  private static respondWithZodError(
    error: ZodError,
    method: 'findAndCount' | 'findOne',
  ) {
    logger.error({ error }, `PostService Zod error: ${method}`)
    return errAsync({
      details: error,
      status: BAD_REQUEST,
      type: 'dto' as const,
    })
  }
}
