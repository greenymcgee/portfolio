import { Suspense } from 'react'

import { getPosts } from '@/features/posts/actions'

import { Pagination } from '../pagination'
import { PostCards } from '../postCards'

type Props = {
  searchParams: Promise<{ limit?: string; page?: string; unpublished?: string }>
}

export async function LatestPosts({ searchParams }: Props) {
  const params = await searchParams
  const { currentPage, error, posts, totalPages } = await getPosts(params)

  if (error) {
    return (
      <div aria-live="polite" data-testid="latest-posts">
        <p data-testid="latest-posts-error">Something went wrong</p>
      </div>
    )
  }

  return (
    <div aria-live="polite" data-testid="latest-posts">
      <PostCards posts={posts} />
      <Suspense>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
