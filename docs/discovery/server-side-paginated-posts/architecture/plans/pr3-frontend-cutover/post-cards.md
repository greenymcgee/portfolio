# `PostCards` — Props Change

> Part of [PR 3 frontend cutover](./README.md) →
> [server-side-paginated-posts architecture](../README.md). Source
> slice: [architecture.md](../../architecture.md) §6.6 "`PostCards`".

File: `features/posts/components/postCards/postCards.tsx` (changed).

## Before (current state)

```tsx
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
```

## After (PR 3)

```tsx
import { Card, CardGroup } from '@/globals/components'
import { ROUTES } from '@/globals/constants'

type Props = {
  posts: AuthoredPost[]
}

export function PostCards({ posts }: Props) {
  return (
    <CardGroup>
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
```

## Key changes

| Aspect | Before | After |
| --- | --- | --- |
| Props type | `{ promise: PaginatedPostsQuery }` | `{ posts: AuthoredPost[] }` |
| Data consumption | `use(promise)` | Direct `posts` prop |
| Error branch | `if (error) return <p data-testid="latest-posts-error">…</p>` | Removed — `LatestPosts` handles errors upstream |
| `import { use }` | Present | Removed |
| `PaginatedPostsQuery` import | Present | Removed |

## Error handling responsibility shift

`PostCards` previously owned the error branch because it was the
consumer of the async `use(promise)` call. After the cutover, errors
are handled at `LatestPosts` level (which calls `getPaginatedPosts` and
checks the `error` field before deciding what to render). `PostCards` is
only called when `posts.length > 0` — it can assume clean data.

The `data-testid="latest-posts-error"` element moves to `LatestPosts`,
not `PostCards`. Existing test assertions on `"latest-posts-error"` must
be updated in the `latestPosts.test.tsx` rewrite.

## `PaginatedPostsQuery` type deletion

`features/posts/types/paginatedPostsQuery.ts` is deleted in PR 3.
Grep for `PaginatedPostsQuery` before shipping PR 3 to confirm zero
remaining references.

## `AuthoredPost` type

`AuthoredPost` is already used throughout the posts feature. The import
may be from `@/prisma/generated/types` or a feature-level type alias —
match whatever `PostService.findAndCount` returns in its `posts` array.
