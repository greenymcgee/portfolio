# `deletePost` — Mutation Invalidation Swap

> Part of [PR 2 backend additive](./README.md) →
> [server-side-paginated-posts architecture](../README.md). Source
> slice: [architecture.md](../../architecture.md) §6.5 "`deletePost`".

File: `features/posts/actions/deletePost.ts` (changed).

## Before (current state)

```typescript
() => {
  revalidatePath(ROUTES.post(state.id))
  revalidatePath(ROUTES.posts)
  redirect(ROUTES.posts)
}
```

`revalidatePath(ROUTES.posts)` invalidates the server-side render cache
for `/posts` but does nothing to the `baseAPI`-fetched client state
inside `useGetPaginatedPostsQuery`. After the cutover in PR 3, there is
no client hook to worry about — but `revalidatePath` also doesn't fan
out across all `?page=N` cached entries, which `revalidateTag` does.

## After (PR 2)

```typescript
() => {
  revalidateTag('posts')
  redirect(ROUTES.posts)
}
```

Both `revalidatePath` calls are removed. `revalidateTag('posts')`
invalidates every `'use cache'` entry tagged `'posts'` — across every
`?page=N` / `{ page, limit }` cache key combination — in a single call.

The `redirect(ROUTES.posts)` stays. The redirect strips query params and
lands the user on page 1. Per the requirements (Flow 4), the admin
manually re-navigates to page 2 — this is the specified behavior.

## Why remove the per-post `revalidatePath` too

`revalidatePath(ROUTES.post(state.id))` was intended to invalidate the
post-detail page cache for the deleted post. Once the post is deleted,
navigating to `/posts/[id]` produces a `NotFoundError` from
`PostService.findOne`, which `PostPageContent` already handles. No
explicit revalidation is needed — the detail page will naturally show
the not-found UI on the next render without caching a stale result.
Removing the call is correct and intentional.

## Important: don't half-migrate

Both `revalidatePath` calls must be removed in the same commit.
Removing only the `ROUTES.posts` call and leaving the per-post call
would leave a dead `revalidatePath` import in the file and a
`revalidatePath` assertion in the existing tests that would break.

## Import change

`revalidatePath` is replaced by `revalidateTag` from `'next/cache'`:

```typescript
// Before:
import { revalidatePath } from 'next/cache'

// After:
import { revalidateTag } from 'next/cache'
```

## Test setup — no changes needed

`vitest.setup.tsx:16` already mocks `revalidateTag` as `vi.fn`. The
existing `deletePost.db.test.ts` test infrastructure is ready; only the
assertion changes from `revalidatePath` to `revalidateTag`.

## PR 2 state on `main`

In PR 2's state (before PR 3 lands), `revalidateTag('posts')` is a
no-op — no `'use cache'`-tagged entries exist yet. The tag call fires
against an empty tag set. This is safe and forward-compatible: once PR 3
introduces `getPaginatedPosts` with `cacheTag('posts')`, any subsequent
delete will invalidate the new entries.
