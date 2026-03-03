import { tryCatch } from '@greenymcgee/typescript-utils'

import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export async function tryCountPosts() {
  const { error, response } = await tryCatch(prisma.post.count())
  if (error) {
    const prismaError = new PrismaError(error)
    logger.error(
      { details: prismaError.details, status: prismaError.status },
      'COUNT_POSTS_ERROR',
    )
    return prismaError
  }

  return response
}
