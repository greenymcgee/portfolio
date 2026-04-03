import { use } from 'react'
import Link from 'next/link'

import { CardGroup } from '@/globals/components'
import { ROUTES } from '@/globals/constants'

import { PaginatedPostsQuery } from '../../types'

type Props = {
  promise: PaginatedPostsQuery
}

export function PostCards({ promise }: Props) {
  const { data, error } = use(promise)

  if (error) return <p data-testid="latest-posts-error">Something went wrong</p>

  return (
    <CardGroup>
      {data.posts.map((post) => (
        <Link
          data-testid={`post-card-${post.id}`}
          href={ROUTES.post(post.id)}
          key={post.id}
        >
          {post.title}
        </Link>
      ))}
    </CardGroup>
  )
}
