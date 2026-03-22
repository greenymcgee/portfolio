import { tryCatch } from '@greenymcgee/typescript-utils'
import { Session } from 'next-auth'

import { PrismaError } from '@/lib/errors'
import { createHeadlessBlogEditor } from '@/lib/lexical'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

import type { PostCreateParams } from '../schemas'

export async function tryInsertPost(
  params: PostCreateParams,
  user: Session['user'],
) {
  const editor = createHeadlessBlogEditor()
  if (!params.content) {
    logger.error(
      { content: params.content },
      'POST_CREATE_MISSING_CONTENT_ERROR',
    )
    return new Error('Post content required')
  }

  try {
    editor.parseEditorState(params.content.toString())
  } catch (error) {
    logger.error({ error }, 'POST_CREATE_CONTENT_VALIDATION_ERROR')
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
      'POST_CREATE_PRISMA_ERROR',
    )
    return prismaError
  }

  return post
}
