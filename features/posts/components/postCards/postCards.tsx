import { Card, CardGroup } from '@/globals/components'
import { ROUTES } from '@/globals/constants'

type Props = {
  posts: AuthoredPost[]
}

export function PostCards({ posts }: Props) {
  if (!posts.length) {
    return (
      <p className="mb-6" data-testid="latest-posts-empty">
        There are no posts available yet.
      </p>
    )
  }

  return (
    <CardGroup className="mb-6">
      {posts.map((post) => (
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
