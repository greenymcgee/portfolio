import { use } from 'react'

import { Card, CardGroup } from '@/globals/components'
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
        <Card
          description={post.description}
          id={String(post.id)}
          key={post.id}
          link={ROUTES.post(post.id)}
          title={post.title}
        />
      ))}
    </CardGroup>
  )
}
