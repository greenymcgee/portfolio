# `LatestPosts` — Async RSC

> Part of [PR 3 frontend cutover](./README.md) →
> [server-side-paginated-posts architecture](../README.md). Source
> slice: [architecture.md](../../architecture.md) §6.6 "`LatestPosts`".

File: `features/posts/components/latestPosts/latestPosts.tsx` (changed).

## Before (current state)

```tsx
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
```

## After (PR 3)

```tsx
import { getPaginatedPosts } from '@/features/posts/actions'
import { ROUTES } from '@/globals/constants'

import { Pagination } from '../pagination'
import { PostCards } from '../postCards'

type Props = {
  searchParams: Promise<{ page?: string }>
}

export async function LatestPosts({
  searchParams,
}: Props) {
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 0

  const { error, posts, totalPages } = await getPaginatedPosts({ page })

  if (error) {
    return (
      <div aria-live="polite" data-testid="latest-posts">
        <p data-testid="latest-posts-error">Something went wrong</p>
      </div>
    )
  }

  return (
    <div aria-live="polite" data-testid="latest-posts">
      {posts.length === 0 ? (
        <p data-testid="latest-posts-empty">No posts on this page</p>
      ) : (
        <PostCards posts={posts} />
      )}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  )
}
```

## Key changes

| Aspect | Before | After |
| --- | --- | --- |
| Directive | `'use client'` | None (async RSC) |
| Signature | `LatestPosts()` | `LatestPosts({ searchParams })` |
| Data fetch | `useGetPaginatedPostsQuery()` hook | `await getPaginatedPosts({ page })` |
| Suspense | Owns its own `<Suspense>` | Suspense lives in `PostsPage` (hoisted) |
| Error branch | Inside `<PostCards>` via `use(promise)` | `if (error)` at the top of `LatestPosts` |
| Empty state | Silent empty `<CardGroup>` | `<p data-testid="latest-posts-empty">` |
| Pagination | None | `<Pagination>` when `totalPages > 1` |

## `page` normalization

`Number(pageParam) || 0` — normalizes `undefined`, `""`, `"abc"`, and
`"0"` to `0`. `"1"` → `1`, etc. Non-numeric inputs land at `0` via the
`||` short-circuit. If `findAndCountPostsSchema`'s Zod validation fails
for the normalized value, `getPaginatedPosts` returns `{ error, posts:
[], totalPages: 0 }` and the error branch fires.

## `data-testid="latest-posts"` wrapper

The outer `<div aria-live="polite" data-testid="latest-posts">` wrapper
is preserved across all branches. Tests can find `"latest-posts"` as a
stable container regardless of which branch rendered.

## `data-testid` preservation

`latest-posts-error` is preserved (same string as today — existing test
assertions carry over). `latest-posts-empty` is new (no equivalent today;
the previous behavior was a silent empty `<CardGroup>`).

## Pattern source

Mirrors `features/posts/components/postPageContent/postPageContent.tsx`:
async RSC that awaits a `Promise` prop (there `params`, here
`searchParams`), calls a server action, and renders the result.

## Test file

`features/posts/components/latestPosts/__tests__/latestPosts.test.tsx`
— rewritten. See [`../testing-strategy.md`](../testing-strategy.md) →
"PR 3 tests → `latestPosts.test.tsx`".
