import { tryCatch } from '@greenymcgee/typescript-utils'

import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

type Params = {
  limit: number
  offset: number
}

export async function tryCollectPosts(params: Params) {
  const { error, response: posts } = await tryCatch(
    prisma.post.findMany({
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: params.offset,
      take: params.limit,
    }),
  )

  if (error) {
    const prismaError = new PrismaError(error)
    logger.error(
      { details: prismaError.details, status: prismaError.status },
      'GET_POSTS_QUERY_ERROR',
    )
    return prismaError
  }

  return posts
}
