# PR 2 — Backend Additive

> Part of [server-side-paginated-posts architecture](../README.md).
> Source slice: [architecture.md](../../architecture.md) §6 "PR 2".

Backend-only PR. Adds the cached read entry, changes the DTO, swaps
`deletePost`'s invalidation primitive, and updates the GET handler to
use the new DTO shape. The frontend is **entirely unaffected** — the
old client hook still calls `GET /api/posts` normally.

## Files changed in PR 2

| File | Change |
| --- | --- |
| `features/posts/actions/getPaginatedPosts.ts` | **New** — cached read entry |
| `features/posts/actions/__tests__/getPaginatedPosts.db.test.ts` | **New** — mocked-service branches + integration |
| `features/posts/dto/find-and-count-posts.dto.ts` | **Changed** — primitives constructor replaces `Request`-based |
| `features/posts/dto/__tests__/find-and-count-posts.dto.test.ts` | **Changed** — drop `Request`-based test cases |
| `features/posts/actions/deletePost.ts` | **Changed** — `revalidatePath` × 2 → `revalidateTag('posts')` |
| `features/posts/actions/__tests__/deletePost.db.test.ts` | **Changed** — assert `revalidateTag`, not `revalidatePath` |
| `app/api/posts/route.ts` | **Changed** — GET handler reads `searchParams` itself, passes primitives to DTO |
| `app/api/posts/__tests__/GET.db.test.ts` | **Changed** — update for primitives DTO (stays until PR 4) |

## Nothing in PR 2 touches

- `app/posts/page.tsx`
- `features/posts/components/`
- `features/posts/hooks/`
- `globals/components/ui/`

## Key invariants

1. **`'use cache'` and `'use server'` are mutually exclusive at the
   function level.** `getPaginatedPosts.ts` opens with `'use cache'`
   inside the function body. The file does **not** have `'use server'`
   at the top. Don't accidentally add it.

2. **`revalidateTag('posts')` is forward-compatible in PR 2.** No
   `'use cache'`-tagged entries exist until PR 3 lands — the tag call
   is a no-op during PR 2's state on `main`. This is intentional.

3. **Both `revalidatePath` calls are removed from `deletePost`.** Don't
   half-migrate — both `ROUTES.post(state.id)` and `ROUTES.posts` calls
   go away. See [`./mutation.md`](./mutation.md).

## Sub-docs

| Concern | Doc |
| --- | --- |
| `getPaginatedPosts` implementation | [`./action.md`](./action.md) |
| `FindAndCountPostsDto` change | [`./dto.md`](./dto.md) |
| `deletePost` mutation swap | [`./mutation.md`](./mutation.md) |
| Test plan | [`../testing-strategy.md`](../testing-strategy.md) → "PR 2 tests" |
