import { tryCatch } from '@greenymcgee/typescript-utils'
import { ZodError } from 'zod'

import { HTTP_TEXT_BY_STATUS, NOT_FOUND } from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

import type { FindAndCountPostsDto } from './dto/find-and-count-posts.dto'
import type { FindPostDto } from './dto/find-post.dto'

export class PostRepository {
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
      prisma.post.findFirst({
        include: { author: { select: { firstName: true, lastName: true } } },
        where: { id },
      }),
    )
    if (error) return new PrismaError(error)

    if (post === null) {
      return new Error(HTTP_TEXT_BY_STATUS[NOT_FOUND], {
        cause: { status: NOT_FOUND },
      })
    }

    return post
  }

  private static async countPosts() {
    const { error, response: count } = await tryCatch(prisma.post.count())
    if (error) return new PrismaError(error)

    return count
  }
}
