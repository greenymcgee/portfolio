import { getPosts } from '@/features/posts/actions'

import { Pagination } from '../pagination'
import { PostCards } from '../postCards'

type Props = {
  searchParams: Promise<{ page?: string }>
}

export async function LatestPosts({ searchParams }: Props) {
  const result = await getPosts(await searchParams)

  if (result.error) {
    return (
      <div aria-live="polite" data-testid="latest-posts">
        <p data-testid="latest-posts-error">Something went wrong</p>
      </div>
    )
  }

  const { currentPage, posts, totalPages } = result
  return (
    <div aria-live="polite" data-testid="latest-posts">
      <PostCards posts={posts} />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
