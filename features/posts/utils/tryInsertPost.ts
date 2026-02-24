import { tryCatch } from '@greenymcgee/typescript-utils'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { Session } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { Post } from '@/prisma/generated/client'

import type { PostCreateParams } from '../schemas'

export function tryInsertPost(params: PostCreateParams, user: Session['user']) {
  return tryCatch<Post, PrismaClientKnownRequestError>(
    prisma.post.create({
      data: {
        authorId: user.id,
        content: params.content ?? undefined,
        publishedAt: params.publishedAt,
        title: params.title,
      },
    }),
  )
}
