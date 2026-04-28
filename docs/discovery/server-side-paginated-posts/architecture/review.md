# Engineering Review — server-side-paginated-posts

> Step 5 output. Self-contained review package. Read this, then either
> approve (implementation can start) or raise concerns (which go to
> `decisions.md` + `todos.md`). Detailed docs are in `plans/`.

---

## What is changing and why

`/posts` currently renders entirely in client state:
`useGetPaginatedPostsQuery` fetches `GET /api/posts?page=N` through
`baseAPI`. When `deletePost` calls `revalidatePath`, the server cache
is invalidated but the client-resident hook data is not — the user sees
stale posts until a hard navigation.

This project fixes that by making the posts list a server-rendered
component that opts into Next.js 16's `'use cache'` + `cacheTag`
invalidation contract. `deletePost` switches to `revalidateTag('posts')`,
which fans out across every cached `?page=N` entry in one call. A
`?page=N`-driven pagination UI ships as part of the same work.

## Ship plan: 4 PRs

| PR | Scope | One-line description |
| --- | --- | --- |
| **PR 1** | UI primitives, additive | Install Shadcn `<Pagination>` — 7 components, one directory each, no consumer yet |
| **PR 2** | Backend, additive | Add `getPaginatedPosts` cached read entry; update DTO and `deletePost`; update GET handler |
| **PR 3** | Frontend, cutover | Rewrite `LatestPosts` as async RSC; delete `useGetPaginatedPostsQuery`; add feature wrapper |
| **PR 4** | Backend cleanup | Delete `GET /api/posts` handler, its test, and the `mockGetPostsResponse` msw helper |

Strict backend/frontend separation per PR. `createPost` is out of scope.
See [`plans/rollout-strategy.md`](./plans/rollout-strategy.md) for
sequencing and rollback plan.

## Component hierarchy after migration

```
PostsPage (sync RSC — app/posts/page.tsx)
├─ AdminMenuContentSetter (PostsPageAdminMenuContent)
└─ <main>
   ├─ <header> (static — streams immediately)
   └─ <article>
      └─ <Suspense fallback={<p>Loading posts...</p>}>
         └─ LatestPosts (async RSC)
            ├─ getPaginatedPosts(await searchParams)  ← 'use cache' + cacheTag('posts')
            ├─ PostCards (RSC, props: { posts })       ← posts.length > 0
            │   OR <p data-testid="latest-posts-empty">  ← posts.length === 0
            └─ <Pagination currentPage totalPages />   ← totalPages > 1 only
               (features/posts/components/pagination/)
               └─ primitives from globals/components/ui/ (PR 1)
```

`app/posts/page.tsx` stays synchronous. All async work is in
`LatestPosts`. `searchParams: Promise<{ page?: string }>` is passed
through from the page to `LatestPosts` without awaiting.

## Key decisions

Each links to its `decisions.md` entry. These are the calls that matter
most for sign-off.

| # | Decision | Rationale summary |
| --- | --- | --- |
| 1 | **Page stays non-async** — async data in `LatestPosts` (RSC) inside `<Suspense>` | Static header streams immediately; pattern mirrors `app/posts/[id]/page.tsx` |
| 2 | **`'use cache'` + `cacheTag('posts')`** — service-direct (no `'use server'`) | `'use cache'` and `'use server'` are mutually exclusive; caching forces service-direct |
| 3 | **`revalidateTag('posts')` replaces two `revalidatePath` calls** | Invalidates every `?page=N` cache entry in one call; `revalidatePath` can't do this for query-string variants |
| 4 | **`getPaginatedPosts(searchParams: { page?: string })`** — no `limit` param, passes awaited `searchParams` object | `limit` is not user-controllable (no UI); DTO owns all normalization via Zod; call site is `getPaginatedPosts(await searchParams)` with no intermediate parsing |
| 5 | **`FindAndCountPostsDto` constructor replaced outright** — `constructor({ page }: { page?: string })` | Request-based shape is dead code once PR 4 ships; no reason to carry a dual-mode DTO |
| 6 | **Shadcn `<Pagination>` over `react-headless-pagination`** | Reuses `cn` + `cva` + `BUTTON_VARIANTS`; no `package.json` churn; copy-paste install |
| 7 | **One directory per primitive** (7 dirs under `globals/components/ui/`) | Consistent with `button/`, `heading/`, `spinner/`, `toaster/` convention |
| 8 | **`<Pagination>` renders only when `totalPages > 1`** | No pagination control for zero-page or single-page results |
| 9 | **Empty state: explicit `<p data-testid="latest-posts-empty">`** | Silent empty list is ambiguous; explicit message is zero-layout-cost improvement |
| 10 | **Out-of-range `?page`: leave as-is (MVP)** | Empty list + empty-state message; no clamp/redirect; acceptable for portfolio |

See [`decisions.md`](./decisions.md) for full rationale and alternatives
considered on each.

## What each PR touches (and doesn't)

### PR 1 — pagination primitives

**New files only under `globals/components/ui/`:**
- `pagination/` `paginationContent/` `paginationItem/` `paginationLink/`
  `paginationPrevious/` `paginationNext/` `paginationEllipsis/`
- Each: `<componentName>.tsx`, `index.ts`,
  `__tests__/<componentName>.test.tsx`
- `globals/components/ui/index.ts` gains 7 export lines

**Not touched:** anything under `app/`, `features/`.

→ [`plans/pr1-pagination-primitives/README.md`](./plans/pr1-pagination-primitives/README.md)

### PR 2 — backend additive

**New:** `features/posts/actions/getPaginatedPosts.ts` +
`__tests__/getPaginatedPosts.db.test.ts`

**Changed:**
- `features/posts/dto/find-and-count-posts.dto.ts` — constructor
  replaced; `url` field + `searchParams` getter removed; `validateParams`
  + `params` getter + Zod schema unchanged
- `features/posts/actions/deletePost.ts` — two `revalidatePath` calls
  → one `revalidateTag('posts')`
- `app/api/posts/route.ts` `GET` handler — passes raw
  `searchParams.get('page')` string to new DTO constructor
- Corresponding tests updated

**Not touched:** anything under `app/posts/`, `features/posts/components/`,
`features/posts/hooks/`.

→ [`plans/pr2-backend-additive/`](./plans/pr2-backend-additive/)

### PR 3 — frontend cutover

**Changed:**
- `app/posts/page.tsx` — stays sync; gains `searchParams: Promise<{page?: string}>`;
  `<Suspense>` fallback hoists here; `LatestPosts` becomes async child
- `features/posts/components/latestPosts/latestPosts.tsx` — drops
  `'use client'`; becomes `async function`; calls
  `getPaginatedPosts(await searchParams)` 
- `features/posts/components/postCards/postCards.tsx` — props: `{ promise }` →
  `{ posts: AuthoredPost[] }`; `use()` and error branch removed

**New:** `features/posts/components/pagination/pagination.tsx` (feature
wrapper) + `__tests__/pagination.test.tsx`; conditional
`getTruncatedPageList.ts` + its test if truncation logic sprawls

**Deleted:** `features/posts/hooks/useGetPaginatedPostsQuery.ts` + test;
`features/posts/types/paginatedPostsQuery.ts`

**Rewritten tests:** `posts.page.test.tsx`, `latestPosts.test.tsx`

**Not touched:** `app/api/posts/`, `features/posts/post.{service,repository}.ts`,
`features/posts/dto/`.

→ [`plans/pr3-frontend-cutover/`](./plans/pr3-frontend-cutover/)

### PR 4 — backend cleanup

**Deleted:** `app/api/posts/route.ts` GET export (file slimmed to
POST-only); `app/api/posts/__tests__/GET.db.test.ts`;
`mockGetPostsResponse` from `test/servers/postsServer.ts`

**Not touched:** anything frontend; POST scaffolding preserved.

→ [`plans/pr4-backend-cleanup.md`](./plans/pr4-backend-cleanup.md)

## What is NOT changing

- `createPost` + `POST /api/posts` — separate project
- `PostService.findAndCount` — no changes below the DTO layer
- `findAndCountPostsSchema` (Zod) — unchanged; `coerce.number()` already
  handles strings/undefined
- `next.config.ts` — `cacheComponents: true` is already set at line 6;
  no touch needed
- Loading/error UX strings — engineer-confirmed sufficient
- `vitest.setup.tsx` — already mocks `revalidateTag` at line 16; no
  new setup needed

## Test coverage per PR

See [`plans/testing-strategy.md`](./plans/testing-strategy.md) for the
full table. In brief:

| PR | Key test addition |
| --- | --- |
| 1 | Smoke + ARIA assertions per primitive in co-located `__tests__/` |
| 2 | `getPaginatedPosts.db.test.ts` (mocked-service branches + one real-DB integration case) |
| 3 | Rewritten `latestPosts.test.tsx` + `posts.page.test.tsx` using `vi.spyOn(PostService, 'findAndCount')`; new `pagination.test.tsx` |
| 4 | Deletion only |

**What is NOT tested:** cache-tag invalidation E2E (requires a live
Next.js server, not Vitest/jsdom) and `'use cache'` directive
observability (Vitest doesn't run the `cacheComponents` pipeline).

## Open items (implementation-time, not blockers)

These are resolved during PR authorship — no engineer call needed.

| Item | PR | Nature |
| --- | --- | --- |
| Primitive a11y assertions per component | PR 1 | Author during implementation |
| `BUTTON_VARIANTS` active/inactive render verification | PR 1 | Verify at implementation |
| `revalidatePath` grep before PR 2 ships | PR 2 | One grep command |
| `'use cache'` deduplication JSDoc | PR 2 | Low-priority comment |
| Wrapper a11y audit | PR 3 | Author during implementation |
| Truncation logic placement (inline vs. extract) | PR 3 | Implementer's call at write-time |
| `cacheLife` revisit | Post-launch | Non-blocking |

## Reference map

| If you need to … | Read |
| --- | --- |
| Understand today's broken read path | [`plans/existing-implementation.md`](./plans/existing-implementation.md) |
| See the full file diff across all 4 PRs | [`plans/proposed-solution.md`](./plans/proposed-solution.md) |
| Deep-dive a specific PR | `plans/pr{1-4}-*/` subdirectories |
| See all decisions with alternatives | [`decisions.md`](./decisions.md) |
| Check security trade-offs | [`plans/security-considerations.md`](./plans/security-considerations.md) |
| Review all test cases | [`plans/testing-strategy.md`](./plans/testing-strategy.md) |
| Understand rollout + rollback | [`plans/rollout-strategy.md`](./plans/rollout-strategy.md) |
| See remaining open items | [`todos.md`](./todos.md) |
