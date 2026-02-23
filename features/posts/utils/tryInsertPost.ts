import { tryCatch } from '@greenymcgee/typescript-utils'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { JWT } from 'next-auth/jwt'

import { prisma } from '@/lib/prisma'
import { Post } from '@/prisma/generated/client'

import type { PostCreateParams } from '../schemas'

export function tryInsertPost(params: PostCreateParams, token: JWT) {
  return tryCatch<Post, PrismaClientKnownRequestError>(
    prisma.post.create({
      data: {
        authorId: token.id,
        content: params.content ?? undefined,
        publishedAt: params.publishedAt,
        title: params.title,
      },
    }),
  )
}
