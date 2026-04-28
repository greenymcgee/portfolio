# server-side-paginated-posts — Architecture (Structured)

> Structured form of [`../architecture.md`](../architecture.md). The
> monolithic doc is retained as a single-file reference; this directory
> is the active working copy. Decisions log:
> [`../decisions.md`](../decisions.md). Open todos:
> [`../todos.md`](../todos.md). Status:
> [`../status.md`](../status.md).

## Which Doc Do I Need?

| If you need to … | Read |
| --- | --- |
| Understand the broken client-side read path today | [`./existing-implementation.md`](./existing-implementation.md) |
| See the full file tree across all 4 PRs | [`./proposed-solution.md`](./proposed-solution.md) |
| Know what the user sees end-to-end (flows + edge cases) | [`./user-facing-behavior.md`](./user-facing-behavior.md) |
| Know what schema / data-model changes are needed | [`./data-models.md`](./data-models.md) |
| Implement the 7 Shadcn pagination primitives (PR 1) | [`./pr1-pagination-primitives/README.md`](./pr1-pagination-primitives/README.md) |
| Implement `getPaginatedPosts` cached read entry (PR 2) | [`./pr2-backend-additive/action.md`](./pr2-backend-additive/action.md) |
| Change `FindAndCountPostsDto` to a primitives constructor (PR 2) | [`./pr2-backend-additive/dto.md`](./pr2-backend-additive/dto.md) |
| Swap `deletePost` from `revalidatePath` to `revalidateTag` (PR 2) | [`./pr2-backend-additive/mutation.md`](./pr2-backend-additive/mutation.md) |
| Rewrite `app/posts/page.tsx` as sync RSC with Suspense fallback (PR 3) | [`./pr3-frontend-cutover/page.md`](./pr3-frontend-cutover/page.md) |
| Rewrite `LatestPosts` as an async RSC (PR 3) | [`./pr3-frontend-cutover/latest-posts.md`](./pr3-frontend-cutover/latest-posts.md) |
| Change `PostCards` props from `{ promise }` to `{ posts }` (PR 3) | [`./pr3-frontend-cutover/post-cards.md`](./pr3-frontend-cutover/post-cards.md) |
| Build the feature-level pagination wrapper (PR 3) | [`./pr3-frontend-cutover/pagination-wrapper.md`](./pr3-frontend-cutover/pagination-wrapper.md) |
| Delete the GET handler + msw helpers (PR 4) | [`./pr4-backend-cleanup.md`](./pr4-backend-cleanup.md) |
| Reason about security trade-offs | [`./security-considerations.md`](./security-considerations.md) |
| Write tests (all PRs) | [`./testing-strategy.md`](./testing-strategy.md) |
| Ship the 4-PR sequence + soaking guidance | [`./rollout-strategy.md`](./rollout-strategy.md) |
| Look up open risks / re-verification items | [`./risks-open-questions.md`](./risks-open-questions.md) |
| See why a decision was made (with alternatives) | [`../decisions.md`](../decisions.md) |

## Document Info

| Field | Value |
| --- | --- |
| Slug | `server-side-paginated-posts` |
| Step | 4 — Structure Architecture |
| Created | 2026-04-28 |
| Last Updated | 2026-04-28 |
| Inputs | [`../inputs/requirements.md`](../inputs/requirements.md) (no constraints file, no design map — see [`../decisions.md`](../decisions.md)) |
| Pattern source | `app/posts/[id]/page.tsx` + `features/posts/components/postPageContent/` (sync-page-with-async-child-in-Suspense), `features/posts/actions/getPost.ts` (server-side function shape), `globals/components/ui/button/` (component-per-directory convention) |
| Monolithic source | [`../architecture.md`](../architecture.md) (kept as reference) |

## Project Overview

`/posts` list page currently lives entirely in client state.
`useGetPaginatedPostsQuery` fetches `GET /api/posts?page=N` through
`baseAPI`; when `deletePost` calls `revalidatePath(ROUTES.posts)` the
server-side render cache is invalidated, but the `baseAPI`-fetched
client state inside `useGetPaginatedPostsQuery` is not — the user sees
stale posts until a hard navigation.

This project replaces the read flow with a server-rendered list inside
an async Server Component nested in `<Suspense>` on a synchronous page.
The read entry opts into Next.js 16's `'use cache'` directive with
`cacheTag('posts')`; `deletePost` switches to `revalidateTag('posts')`,
which fans out across every cached `?page=N` variant in one call.

```
PostsPage (sync RSC — app/posts/page.tsx)
├─ AdminMenuContentSetter (PostsPageAdminMenuContent)
└─ <main>
   ├─ <header> (static — streams immediately)
   └─ <article>
      └─ <Suspense fallback={<p>Loading posts...</p>}>
         └─ LatestPosts (async RSC)
            ├─ getPaginatedPosts({ page, limit: 10 }) ← 'use cache' + cacheTag('posts')
            ├─ PostCards (RSC, props: { posts })       ← posts.length > 0
            │   OR <p data-testid="latest-posts-empty"> ← posts.length === 0
            └─ <Pagination currentPage totalPages />   ← totalPages > 1 only
               (features/posts/components/pagination/ — PR 3)
               └─ primitives from globals/components/ui/ (PR 1)
```

## Key Design Decisions

Numbered for cross-reference — each links into [`../decisions.md`](../decisions.md).

1. **Page stays non-async.** Static header streams immediately; async
   data fetch lives in `LatestPosts` (async RSC) inside `<Suspense>`.
   ([`../decisions.md`](../decisions.md) → "Page stays non-async;
   async-child-in-Suspense pattern")
2. **Service-direct + `'use cache'` + `cacheTag('posts')`.** `'use
   cache'` and `'use server'` are mutually exclusive at the function
   level; caching forces service-direct. ([`../decisions.md`](../decisions.md)
   → "Q1 resolved")
3. **`revalidateTag('posts')` replaces two `revalidatePath` calls in
   `deletePost`.** Fans out across every `?page=N` cache entry in one
   call. ([`../decisions.md`](../decisions.md) → "Q1 resolved")
4. **Shadcn `<Pagination>` (copy-paste install).** No new `package.json`
   dependency; reuses `cn` + `cva` + `BUTTON_VARIANTS`.
   ([`../decisions.md`](../decisions.md) → "Q2 resolved")
5. **One component per directory for pagination primitives.** Consistent
   with `button/`, `heading/`, `spinner/`, `toaster/`.
   ([`../decisions.md`](../decisions.md) → "One component per file for
   pagination primitives")
6. **Barrel export: one directory per primitive, re-exported from
   `globals/components/ui/index.ts`.** Consistent with existing UI
   convention. ([`../decisions.md`](../decisions.md) → "Barrel export")
7. **DTO shape replaced outright in PR 2.** `Request`-based constructor
   → `{ page, limit }` primitives; Zod schema unchanged.
   ([`../decisions.md`](../decisions.md) → "DTO shape: replace outright
   in PR 1 (option c)")
8. **`<Pagination>` renders only when `totalPages > 1`.** Collapses the
   `totalPages=0`/`=1` edge cases. ([`../decisions.md`](../decisions.md)
   → "Pagination renders only when `totalPages > 1`")
9. **Empty-state explicit message.** `<p data-testid="latest-posts-empty">No
   posts on this page</p>` when `posts.length === 0`.
   ([`../decisions.md`](../decisions.md) → "Empty-state UX")
10. **Out-of-range `?page` left as-is (MVP).** Empty list + empty-state
    message. ([`../decisions.md`](../decisions.md) → "Out-of-range `?page`")
11. **Truncation logic: implementation-time call.** Default inline;
    extract to `getTruncatedPageList.ts` if it sprawls during PR 3.
    ([`../decisions.md`](../decisions.md) → "Truncation logic placement")
12. **4-PR sequence.** Pagination primitives → backend additive →
    frontend cutover → backend cleanup.
    ([`../decisions.md`](../decisions.md) → "Ship plan refined to 4 PRs")
13. **`createPost` is out of scope.** Separate project.
    ([`../decisions.md`](../decisions.md) → "Scope: read path only")

## Architecture Docs

### PR 1 — Pagination primitives (`./pr1-pagination-primitives/`)

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Overview, 7 primitives, per-component test plan | One dir per primitive; `BUTTON_VARIANTS` reuse for `<PaginationLink>` | [`./pr1-pagination-primitives/README.md`](./pr1-pagination-primitives/README.md) |

### PR 2 — Backend additive (`./pr2-backend-additive/`)

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Overview + file scope | Additive-only; `GET /api/posts` stays; no frontend changes | [`./pr2-backend-additive/README.md`](./pr2-backend-additive/README.md) |
| `getPaginatedPosts` | `'use cache'` + `cacheTag('posts')`; service-direct; **no** `'use server'` | [`./pr2-backend-additive/action.md`](./pr2-backend-additive/action.md) |
| `FindAndCountPostsDto` | Primitives constructor replaces `Request`-based; Zod schema unchanged | [`./pr2-backend-additive/dto.md`](./pr2-backend-additive/dto.md) |
| `deletePost` mutation | Swaps two `revalidatePath` calls for one `revalidateTag('posts')` | [`./pr2-backend-additive/mutation.md`](./pr2-backend-additive/mutation.md) |

### PR 3 — Frontend cutover (`./pr3-frontend-cutover/`)

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Overview + file scope | Cutover; `useGetPaginatedPostsQuery` deleted; no route changes | [`./pr3-frontend-cutover/README.md`](./pr3-frontend-cutover/README.md) |
| `PostsPage` | Stays sync; passes `searchParams: Promise` through; Suspense fallback hoists | [`./pr3-frontend-cutover/page.md`](./pr3-frontend-cutover/page.md) |
| `LatestPosts` | Becomes async RSC; awaits searchParams; empty-state + error branches | [`./pr3-frontend-cutover/latest-posts.md`](./pr3-frontend-cutover/latest-posts.md) |
| `PostCards` | Props change: `{ promise }` → `{ posts }`; `use()` gone | [`./pr3-frontend-cutover/post-cards.md`](./pr3-frontend-cutover/post-cards.md) |
| Pagination wrapper | Feature wrapper at `features/posts/components/pagination/` with truncation rule | [`./pr3-frontend-cutover/pagination-wrapper.md`](./pr3-frontend-cutover/pagination-wrapper.md) |

### PR 4 — Backend cleanup

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Cleanup | Delete GET handler + its test + `mockGetPostsResponse` | [`./pr4-backend-cleanup.md`](./pr4-backend-cleanup.md) |

### Cross-cutting

| Area | Key decision summary | Doc |
| --- | --- | --- |
| User-facing behavior | 2 personas, 4 flows, 8 edge-case scenarios | [`./user-facing-behavior.md`](./user-facing-behavior.md) |
| Data models | No schema changes; `Post` model unchanged | [`./data-models.md`](./data-models.md) |
| Security | Public read; admin-gated write; no auth-scoped data in cache | [`./security-considerations.md`](./security-considerations.md) |
| Testing | All test files by PR (new, rewritten, deleted) | [`./testing-strategy.md`](./testing-strategy.md) |
| Rollout | 4-PR sequence with soaking guidance and rollback plan | [`./rollout-strategy.md`](./rollout-strategy.md) |
| Existing implementation | Current broken client-side read path | [`./existing-implementation.md`](./existing-implementation.md) |
| Proposed solution | Full file tree across all 4 PRs | [`./proposed-solution.md`](./proposed-solution.md) |
| Risks | 8 risks (all low after Step 2 research) | [`./risks-open-questions.md`](./risks-open-questions.md) |

## Existing Patterns Reused

| Concern | Reference | Notes |
| --- | --- | --- |
| Sync page + async child in `<Suspense>` | `app/posts/[id]/page.tsx` + `features/posts/components/postPageContent/postPageContent.tsx` | Canonical pattern this project adopts; `PostsPage` mirrors `PostPage`, `LatestPosts` mirrors `PostPageContent` |
| Server-side function shape (`Service.findX(dto)` → `result.match`) | `features/posts/actions/getPost.ts` | Mirror for `getPaginatedPosts` — minus `'use server'` (replaced by `'use cache'`) |
| DB-test pattern for actions | `features/posts/actions/__tests__/getPost.db.test.ts` | Mirror for `getPaginatedPosts.db.test.ts` |
| Component-per-directory convention | `globals/components/ui/button/`, `heading/`, `spinner/`, `toaster/` | Applied to each of the 7 pagination primitives |
| `BUTTON_VARIANTS` reuse | `globals/components/ui/button/constants.ts` | `<PaginationLink>` active (`outline`) / inactive (`ghost`) styling at `size: 'icon-sm'` |
| `searchParams` / `params` as `Promise` passed through Suspense | `app/posts/[id]/page.tsx` (`params: Promise<{ id: number }>`) | Applied to `searchParams: Promise<{ page?: string }>` in `PostsPage` → `LatestPosts` |
| `vi.spyOn(PostService, 'findAndCount')` for RSC tests | `features/posts/actions/__tests__/getPost.db.test.ts` pattern | Replaces msw `mockGetPostsResponse` in rewritten `latestPosts.test.tsx` and `posts.page.test.tsx` |

## References

### Internal

- [`../inputs/requirements.md`](../inputs/requirements.md) — source of truth for user-facing behavior.
- [`../architecture.md`](../architecture.md) — monolithic architecture doc (retained as reference).
- [`../decisions.md`](../decisions.md) — append-only decision log.
- [`../todos.md`](../todos.md) — open and resolved discovery items.
- [`../status.md`](../status.md) — step tracker.

### External

- [`'use cache'` directive — Next.js docs](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [`cacheTag` — Next.js docs](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [`revalidateTag` — Next.js docs](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Shadcn Pagination](https://ui.shadcn.com/docs/components/pagination)
