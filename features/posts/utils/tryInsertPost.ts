import { tryCatch } from '@greenymcgee/typescript-utils'
import { Session } from 'next-auth'

import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

import type { PostCreateParams } from '../schemas'

export async function tryInsertPost(
  params: PostCreateParams,
  user: Session['user'],
) {
  const { error, response: post } = await tryCatch(
    prisma.post.create({
      data: {
        authorId: user.id,
        content: params.content ?? undefined,
        publishedAt: params.publishedAt,
        title: params.title,
      },
    }),
  )
  if (error) {
    const prismaError = new PrismaError(error)
    logger.error(
      { details: prismaError.details, status: prismaError.status },
      'POST_CREATE_PRISMA_ERROR',
    )
    return prismaError
  }

  return post
}
