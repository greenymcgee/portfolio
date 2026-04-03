'use client'

import { Suspense } from 'react'

import { useGetPaginatedPostsQuery } from '../../hooks'
import { PostCards } from '../postCards'

export function LatestPosts() {
  const promise = useGetPaginatedPostsQuery()
  return (
    <div aria-live="polite" data-testid="latest-posts">
      <Suspense fallback={<p>Loading posts...</p>}>
        <PostCards promise={promise} />
      </Suspense>
    </div>
  )
}
