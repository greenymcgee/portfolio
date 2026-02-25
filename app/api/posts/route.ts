import { NextResponse } from 'next/server'

import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/constants'
import { CreatePostService } from '@/features/posts/services'
import { createResponse } from '@/lib/db'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const postsPerPage = 5
  const offset = (page - 1) * postsPerPage

  // Fetch paginated posts
  const posts = await prisma.post.findMany({
    include: { author: { select: { firstName: true } } },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: postsPerPage,
  })

  const totalPosts = await prisma.post.count()
  const totalPages = Math.ceil(totalPosts / postsPerPage)

  return NextResponse.json({ posts, totalPages })
}

export async function POST(request: Request) {
  const service = new CreatePostService(request)
  const result = await service.createPost()
  return result.match(
    (response) => {
      return createResponse({
        body: { post: response.post },
        status: response.status,
        url: request.url,
      })
    },
    (error) => {
      switch (error.status) {
        case FORBIDDEN:
        case UNAUTHORIZED:
        case BAD_REQUEST:
        case CONFLICT:
        case INTERNAL_SERVER_ERROR:
        case NOT_FOUND:
        case UNPROCESSABLE_CONTENT: {
          return createResponse({ status: error.status, url: request.url })
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_CREATE_POST_ERROR',
          )
          return createResponse({
            status: INTERNAL_SERVER_ERROR,
            url: request.url,
          })
        }
      }
    },
  )
}
