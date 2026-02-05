import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const postsPerPage = 5
  const offset = (page - 1) * postsPerPage

  // Fetch paginated posts
  const posts = await prisma.post.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: postsPerPage,
  })

  const totalPosts = await prisma.post.count()
  const totalPages = Math.ceil(totalPosts / postsPerPage)

  return NextResponse.json({ posts, totalPages })
}
