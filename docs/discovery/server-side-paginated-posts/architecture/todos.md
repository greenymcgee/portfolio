# Todos — server-side-paginated-posts

> Items added by the skill are marked `[skill]`; engineer-added items are
> marked `[engineer]`. Resolved items move to `decisions.md` with
> rationale.

## Open

- [ ] **Q1 — Read entry shape (service-direct vs. action-wrapper, ± `cacheTag`).**
      The async-Server-Component shape is locked (see `decisions.md` →
      "Page stays non-async; async-child-in-Suspense pattern"). The
      remaining question is what the async `LatestPosts` calls:
      (a) `PostService.findAndCount` directly through a primitives DTO
      (server-component-only, no `'use server'`), or (b) a new
      `getPaginatedPosts` server action that wraps
      `PostService.findAndCount` (mirrors `getPost`). Either option can
      additionally opt into (c) `'use cache'` / `cacheTag('posts')` for
      tag-based invalidation. Resolve during Step 2 after a focused
      research pass on Next.js 16.1.6 `next/cache` semantics. This is
      the marquee Step-2 question — it determines DTO shape, the read
      file's location, the invalidation primitive in `deletePost`, and
      the page-test rewrite strategy. `[skill]`
- [ ] **Q2 — Pagination library.** Evaluate `react-headless-pagination`
      (engineer used before, decent results) against (a) a small custom
      headless component built on `next/link` + `useSearchParams`, and
      (b) any newer headless pagination libraries discovered during
      research. Resolve during Step 2; affects PR 2 only. `[skill]`
- [ ] **Invalidation primitive selection.**
      `revalidatePath('/posts', 'page')` (path-shaped, fans out across
      all `?page=` variants per Next.js 16 docs) vs.
      `revalidateTag('posts')` (tag-shaped, requires the read path to
      opt into the tag). Choice is downstream of Q1. Update
      `deletePost` to use whichever lands; remove the redundant
      `revalidatePath(ROUTES.posts)` line if `revalidateTag` covers
      it. Lands in PR 1. `[skill]`
- [ ] **`FindAndCountPostsDto` shape.** Current DTO takes a `Request`
      (`new FindAndCountPostsDto(request)`). The new read entry needs
      `{ page, limit }` primitives. Decide between (a) widening the
      existing DTO to accept both, (b) introducing a sibling
      `FindAndCountPostsParamsDto`, or (c) replacing the `Request`-based
      DTO outright in PR 1 (it becomes dead code once PR 3 ships and
      the GET handler goes — could be removed in PR 1 directly,
      sparing a transitional code path). Lands in PR 1. `[skill]`
- [ ] **PR 3 sequencing — confirm GET handler has no other callers.**
      Before PR 3 ships, grep `baseAPI.get` and `API_ROUTES.posts` to
      confirm `useGetPaginatedPostsQuery` (deleted in PR 2) was the
      only `/api/posts` GET caller. Confirm
      `app/api/posts/__tests__/GET.db.test.ts` and the
      `mockGetPostsResponse` helper can go alongside the route handler.
      Confirm the `postsServer` msw setup keeps its POST scaffolding
      for `createPost` (separate project, still HTTP). `[skill]`
- [ ] **Page test rewrite (PR 2).** `app/posts/__tests__/posts.page.test.tsx`
      currently relies on the hook + msw GET. Pick the post-conversion
      test shape: render the page with `vi.spyOn(PostService,
      'findAndCount')` (mocked-service branches) vs. db-test
      integration (`setupTestDatabase` + real Prisma). Choice is
      downstream of Q1. `[skill]`

## Closed (during Step 1)

| Item | Resolution |
| --- | --- |
| Skip design map | Engineer-confirmed in `requirements.md` § Designs ("Status: Not needed"). See `decisions.md` → "Skip design map". |
| Skip standalone `constraints.md` | Engineer-confirmed inline in `requirements.md` § Data & Fields → Constraints. See `decisions.md` → "Skip standalone constraints file". |
| Scope: read path + GET handler deletion only | `createPost` migration and POST handler are a separate project. See `decisions.md` → "Scope: read path only; `createPost` is a separate project". |
| Pagination UI in scope, separate PR | UI lands in PR 2; backend additive in PR 1; backend cleanup in PR 3. `react-headless-pagination` is the engineer-flagged candidate, alternatives open. See `decisions.md` → "Pagination UI in scope, separate PR from backend" (refined by the 3-PR ship plan). |
| Read-pattern decision deferred | Async-Server-Component shape locked; service-direct vs. action-wrapper deferred to Step 2 as Q1. See `decisions.md` → "Defer read-pattern decision to Step 2" (refined by "Page stays non-async; async-child-in-Suspense pattern"). |
| Page must stay non-async | Page stays sync; async work lives in a child Server Component inside `<Suspense>`; `searchParams` flows through as a `Promise`. See `decisions.md` → "Page stays non-async; async-child-in-Suspense pattern". |
| PR shape | 3 PRs with strict backend / frontend separation. See `decisions.md` → "Ship plan: 3 PRs with strict backend / frontend separation". |
| Suspense / loading shape | Resolved by the locked pattern: existing `<p>Loading posts...</p>` fallback hoists from inside `LatestPosts` to inside the page (around the async child). Engineer-confirmed loading states are sufficient. |
