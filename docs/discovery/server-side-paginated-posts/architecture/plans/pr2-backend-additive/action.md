# `getPaginatedPosts` — Cached Read Entry

> Part of [PR 2 backend additive](./README.md) →
> [server-side-paginated-posts architecture](../README.md). Source
> slice: [architecture.md](../../architecture.md) §6.5 "Services /
> Workers → getPaginatedPosts".

File: `features/posts/actions/getPaginatedPosts.ts` (new).

## Implementation

```typescript
import { cacheTag } from 'next/cache'

import { logger } from '@/lib/logger'

import { FindAndCountPostsDto } from '../dto'
import { PostService } from '../post.service'

export async function getPaginatedPosts(
  searchParams: { page?: string },
): Promise<{
  currentPage: number
  error: ReturnType<typeof PostService.findAndCount> extends Promise<infer R>
    ? R extends { _tag: 'Err' }
      ? R['error']
      : never
    : never | null
  posts: AuthoredPost[]
  totalPages: number
}> {
  'use cache'
  cacheTag('posts')

  const dto = new FindAndCountPostsDto(searchParams)
  const result = await PostService.findAndCount(dto)
  return result.match(
    ({ posts, totalPages }) => ({
      currentPage: dto.params.offset / dto.params.limit,
      error: null,
      posts,
      totalPages,
    }),
    (error) => {
      switch (error.type) {
        case 'dto':
        case 'entity': {
          return { currentPage: 0, error, posts: [], totalPages: 0 }
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_FIND_AND_COUNT_POSTS_ERROR',
          )
          return { currentPage: 0, error, posts: [], totalPages: 0 }
        }
      }
    },
  )
}
```

Note: the exact return-type annotation for `error` is illustrative —
use whatever the codebase's typed `neverthrow` error shape demands. The
key shape is `{ error: ..., posts: AuthoredPost[], totalPages: number }`.

## Why `'use cache'` inside the function, not at the file level

`'use cache'` can appear at the file level (making every export cached)
or at the function level (scoping the cache to that function). Since
this file exports only one function and the directive semantics are
identical in this case, either placement is correct. Function-level is
preferred here for clarity — the cache boundary is explicit at the
entry point.

## Why no `'use server'`

`'use cache'` and `'use server'` are mutually exclusive at the function
level. A function marked `'use server'` is a server action — callable
from the client via a POST request. A function marked `'use cache'` is
a cached computation — callable only from server-side code (RSCs, other
server actions). We need cache, not client-callability, so `'use server'`
is absent.

`getPaginatedPosts` lives at `features/posts/actions/getPaginatedPosts.ts`
for filesystem symmetry with `getPost.ts`, not because it is a server
action in the traditional sense.

See [`../../decisions.md`](../../decisions.md) → "Q1 resolved: cached
service-direct read entry with `cacheTag('posts')`; `revalidateTag`
invalidation".

## Cache semantics

- **Cache key:** `searchParams` per `'use cache'` key rules (build ID
  + function ID + serialized arguments). Each `?page=N` request maps
  to a separate cache entry.
- **Tag:** every entry is tagged `'posts'` via `cacheTag('posts')`.
  `revalidateTag('posts')` invalidates *every* entry tagged `'posts'`
  in one call — across all `?page=N` values.
- **Cache lifetime:** default `cacheLife` profile (5min stale / 15min
  revalidate). Override only if post-launch monitoring shows staleness.
- **`searchParams` rule:** `'use cache'` cannot read `searchParams`,
  `cookies`, or `headers` directly. Values must be passed as arguments.
  The awaited `searchParams` object satisfies this constraint — it is a
  plain serializable value by the time `getPaginatedPosts` receives it.

## Callers

`LatestPosts` (async RSC) only. No client-side callers possible (no
`'use server'`). Document at the call site so future authors know the
boundary exists.

## Pattern source

Mirrors `features/posts/actions/getPost.ts` structurally:
- Same import style (`logger`, `PostService`, DTO).
- Same `result.match(...)` shape (success returns data; error returns a
  zero-value envelope).
- Same `UNHANDLED_*_ERROR` logger branch with `satisfies never`.

Key difference from `getPost`:
- `'use cache'` replaces `'use server'`.
- `cacheTag('posts')` call added.
- Returns `{ error, posts, totalPages }` instead of `{ error, post }`.

## Test file

`features/posts/actions/__tests__/getPaginatedPosts.db.test.ts` — see
[`../testing-strategy.md`](../testing-strategy.md) → "PR 2 tests →
`getPaginatedPosts.db.test.ts`".
