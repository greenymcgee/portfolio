# Rollout Strategy — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §6.18.

## Shape

- **4 PRs, sequential.** Each PR has a single reviewable concern and can
  soak independently on `main` before the next lands.
- **No feature flag.** Per `inputs/requirements.md` § Rollout &
  Feature Flags ("This feature will go straight to main"). The 4-PR
  split *is* the progressive rollout.
- **No migration.** No schema changes, no backfill, no data-shape
  changes.
- **Backward-compatible until PR 3.** PRs 1 and 2 are purely additive;
  the user-facing read path changes only when PR 3 lands.

## PR sequence and soaking guidance

| PR | What lands | Soaking before next PR |
| --- | --- | --- |
| 1 | Shadcn pagination primitives (dead code until PR 3) | Brief — primitives are inert; only CI signal matters |
| 2 | Cached read entry + DTO change + `deletePost` mutation swap | At least one delete-flow exercise to confirm `revalidateTag` fires and tests pass (tag is a no-op until PR 3, but the test assertion holds) |
| 3 | Frontend cutover — user-visible change | At least one full delete-flow exercise end-to-end (Flow 3 + Flow 4 from [`./user-facing-behavior.md`](./user-facing-behavior.md)) |
| 4 | GET handler deletion — pure cleanup | Ship promptly after PR 3 soaks |

## Pre-merge checklist per PR

### PR 1

- [ ] All 7 primitive test files green locally + in CI.
- [ ] `globals/components/ui/index.ts` has exactly 7 new `export *` lines.
- [ ] No `app/`, `features/`, or `next.config.ts` files changed.

### PR 2

- [ ] `getPaginatedPosts.db.test.ts` green (integration path exercises
  real Prisma).
- [ ] `deletePost.db.test.ts` asserts `revalidateTag('posts')` called,
  not `revalidatePath`.
- [ ] `find-and-count-posts.dto.test.ts` updated — no `Request`-based
  test cases remain.
- [ ] `GET.db.test.ts` updated for primitives-constructor DTO shape.
- [ ] Grep `revalidatePath` in `deletePost.ts` returns zero hits.
- [ ] No `app/posts/`, `features/posts/components/`, or
  `features/posts/hooks/` files changed.

### PR 3

- [ ] `posts.page.test.tsx` rewritten — no `mockGetPostsResponse` import.
- [ ] `latestPosts.test.tsx` rewritten — no `mockGetPostsResponse` import.
- [ ] `useGetPaginatedPostsQuery.test.ts` deleted.
- [ ] `pagination.test.tsx` (wrapper) green — truncation table cases pass.
- [ ] `PaginatedPostsQuery` type — grep confirms zero remaining references.
- [ ] `useGetPaginatedPostsQuery` hook — grep confirms zero remaining references.
- [ ] No `app/api/posts/`, `features/posts/post.{service,repository}.ts`,
  or `features/posts/dto/` files changed.

### PR 4

- [ ] `GET.db.test.ts` deleted.
- [ ] `postsServer.ts` — GET handler removed, `mockGetPostsResponse` removed.
- [ ] `postsServer.ts` POST handler + `mockPostsCreateResponse` — grep
  confirms both survive.
- [ ] `test/servers/index.ts` — `mockGetPostsResponse` export removed
  if it was re-exported there.
- [ ] No frontend files changed.

## Manual staging verification (after PR 3)

1. Navigate to `/posts`. Confirm the post list renders without the
   loading spinner hanging.
2. Navigate to `/posts?page=1`. Confirm page 2 results appear and the
   pagination control shows "2" as active.
3. Delete a post (admin session). Confirm:
   a. Browser redirects to `/posts` (page 1).
   b. The deleted post is absent.
4. Navigate to `/posts?page=1` after deletion. Confirm:
   a. The page fetches fresh data (deleted post absent — verifies
      `revalidateTag` fanned out across all pages).
5. Navigate to `/posts?page=999`. Confirm the empty-state message
   renders and the pagination control still appears.
6. Navigate to `/posts?page=abc`. Confirm the error-state message
   renders (Zod coercion fails, error branch fires).

## Rollback plan

**If a regression appears post-PR 3:**
1. Revert PR 3. PRs 1 and 2 are inert without the frontend cutover
   (except for `deletePost`'s tag swap, which is harmless — `revalidateTag`
   against zero cached entries is a no-op, and `revalidatePath` is gone
   from the action; confirm the old revalidation behavior is acceptable
   in the reverted state or include a `revalidatePath` restore in the
   revert).
2. PR 4 should not ship until PR 3 has soaked cleanly — a PR 3 revert
   means PR 4 is also blocked.

**If a regression appears post-PR 4:**
1. Restore the `GET /api/posts` handler from git history. No frontend
   needs updating (PR 3's frontend does not call the route).
