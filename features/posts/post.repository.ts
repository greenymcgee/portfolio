import { tryCatch } from '@greenymcgee/typescript-utils'
import type { Session } from 'next-auth'

import { NO_CONTENT } from '@/globals/constants'
import { NotFoundError, PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import type {
  PostDefaultArgs,
  PostGetPayload,
  PostUpdateInput,
} from '@/prisma/generated/models'

import type { CreatePostParams } from './dto/create-post.dto'
import type { FindAndCountPostParams } from './dto/find-and-count-posts.dto'
import { PostEntity } from './post.entity'

export class PostRepository {
  public static async create(params: CreatePostParams, user: Session['user']) {
    const { error, response: post } = await tryCatch(
      prisma.post.create({
        data: {
          authorId: user.id,
          content: params.content?.toString(),
          description: params.description,
          publishedAt: params.publishedAt,
          title: params.title,
        },
      }),
    )
    if (error) {
      const prismaError = new PrismaError(error)
      logger.error(
        { details: prismaError.details, status: prismaError.status },
        'PostRepository Prisma error:',
      )
      return prismaError
    }

    return post
  }

  public static async delete(id: number) {
    const { error, response } = await tryCatch(
      prisma.post.delete({ where: { id } }),
    )
    if (error) return new PrismaError(error)

    if (response === null) return new NotFoundError(id, 'Post')

    return { status: NO_CONTENT } as const
  }

  public static async findAndCount(params: FindAndCountPostParams) {
    const { error, response: posts } = await tryCatch(
      PostEntity.findMany({
        limit: params.limit,
        offset: params.offset,
        unpublished: params.unpublished,
      }),
    )
    if (error) return new PrismaError(error)

    const count = await this.count(params)
    if (count instanceof PrismaError) return count

    return {
      currentPage: params.currentPage,
      offset: params.offset,
      posts,
      totalPages: Math.ceil(count / params.limit),
    }
  }

  public static async findOne<Options extends PostDefaultArgs>(
    id: number,
    options?: Options,
  ) {
    const { error, response: post } = await tryCatch(
      prisma.post.findUnique({ where: { id }, ...options }),
    )
    if (error) return new PrismaError(error)

    if (post === null) return new NotFoundError(id, 'Post')

    return post as PostGetPayload<Options>
  }

  public static async update(id: number, data: PostUpdateInput) {
    const { error, response: post } = await tryCatch(
      prisma.post.update({ data, where: { id } }),
    )

    if (error) return new PrismaError(error)

    if (post === null) return new NotFoundError(id, 'Post')

    return post
  }

  private static async count(
    params: FirstParameterOf<typeof PostEntity.count>,
  ) {
    const { error, response: count } = await tryCatch(PostEntity.count(params))
    if (error) return new PrismaError(error)

    return count
  }
}
