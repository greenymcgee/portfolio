import { tryCatch } from '@greenymcgee/typescript-utils'
import type { Session } from 'next-auth'
import { ZodError } from 'zod'

import { NO_CONTENT } from '@/globals/constants'
import { NotFoundError, PrismaError, RequestJSONError } from '@/lib/errors'
import { createHeadlessBlogEditor } from '@/lib/lexical'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

import type { CreatePostDto } from './dto/create-post.dto'
import type { FindAndCountPostsDto } from './dto/find-and-count-posts.dto'
import type { FindPostDto } from './dto/find-post.dto'

export class PostRepository {
  public static async create(dto: CreatePostDto, user: Session['user']) {
    const params = await dto.getParams()
    if (params instanceof RequestJSONError || params instanceof ZodError) {
      return params
    }

    const editor = createHeadlessBlogEditor()
    try {
      editor.parseEditorState(params.content.toString())
    } catch (error) {
      logger.error({ error }, 'PostRepository editorState error:')
      return new Error('Post content validation failed')
    }

    const { error, response: post } = await tryCatch(
      prisma.post.create({
        data: {
          authorId: user.id,
          content: params.content.toString(),
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

  public static async delete(dto: FindPostDto) {
    const id = await dto.getId()
    if (id instanceof ZodError) return id

    const { error, response } = await tryCatch(
      prisma.post.delete({ where: { id } }),
    )
    if (error) return new PrismaError(error)

    if (response === null) return new NotFoundError(id, 'Post')

    return { status: NO_CONTENT } as const
  }

  public static async findAndCount(dto: FindAndCountPostsDto) {
    const { params } = dto
    if (params instanceof ZodError) return params

    const { error, response: posts } = await tryCatch(
      prisma.post.findMany({
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: params.offset,
        take: params.limit,
      }),
    )
    if (error) return new PrismaError(error)

    const count = await PostRepository.countPosts()
    if (count instanceof PrismaError) return count

    return { posts, totalPages: Math.ceil(count / params.limit) }
  }

  public static async findOne(dto: FindPostDto) {
    const id = await dto.getId()
    if (id instanceof ZodError) return id

    const { error, response: post } = await tryCatch(
      prisma.post.findUnique({
        include: { author: { select: { firstName: true, lastName: true } } },
        where: { id },
      }),
    )
    if (error) return new PrismaError(error)

    if (post === null) return new NotFoundError(id, 'Post')

    return post
  }

  private static async countPosts() {
    const { error, response: count } = await tryCatch(prisma.post.count())
    if (error) return new PrismaError(error)

    return count
  }
}
