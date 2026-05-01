# Todos — server-side-paginated-posts

> Items added by the skill are marked `[skill]`; engineer-added items are
> marked `[engineer]`. Resolved items move to `decisions.md` with
> rationale.


### Post-launch

- [ ] **Cache lifetime — revisit post-launch.** Default `cacheLife`
      profile (5min stale / 15min revalidate / no expire) is the MVP
      choice. After PR 3 has soaked, check whether observed staleness
      is a complaint. If so, swap to `cacheLife({ stale: 60,
      revalidate: 300 })` or similar. Not a launch blocker. `[skill]`

### Low-priority ongoing

- [ ] **`'use cache'` request-scope deduplication — document
      behavior in JSDoc.** When `getPosts({ page: '0' })` is
      called twice within the same request (e.g., from `LatestPosts`
      and from a hypothetical sibling RSC), Next.js's cache should
      serve the second call from the in-flight cache entry without
      re-running Prisma. Today only `LatestPosts` calls it, but if a
      future surface adds a second caller, we want the deduplication
      contract documented at the call site. Low-priority; document in
      JSDoc rather than test. `[skill]`

## Closed

| Item | Resolution |
| --- | --- |
| Skip design map | Engineer-confirmed in `requirements.md` § Designs ("Status: Not needed"). See `decisions.md` → "Skip design map". |
| Skip standalone `constraints.md` | Engineer-confirmed inline in `requirements.md` § Data & Fields → Constraints. See `decisions.md` → "Skip standalone constraints file". |
| Scope: read path + GET handler deletion only | `createPost` migration and POST handler are a separate project. See `decisions.md` → "Scope: read path only; `createPost` is a separate project". |
| Pagination UI in scope, separate PR | UI primitives land in PR 1; backend additive in PR 2; frontend cutover (with feature-level wrapper) in PR 3; backend cleanup in PR 4. See `decisions.md` → "Pagination UI in scope, separate PR from backend" (refined by the 3-PR ship plan, then refined again to 4 PRs). |
| Read-pattern decision deferred | Async-Server-Component shape locked; service-direct vs. action-wrapper deferred to Step 2 as Q1. See `decisions.md` → "Defer read-pattern decision to Step 2" (refined by "Page stays non-async; async-child-in-Suspense pattern"). |
| Page must stay non-async | Page stays sync; async work lives in a child Server Component inside `<Suspense>`; `searchParams` flows through as a `Promise`. See `decisions.md` → "Page stays non-async; async-child-in-Suspense pattern". |
| PR shape | 4 PRs: pagination primitives → backend additive → frontend cutover → backend cleanup. See `decisions.md` → "Ship plan refined to 4 PRs (pagination install carve-out)". |
| Suspense / loading shape | Resolved by the locked pattern: existing `<p>Loading posts...</p>` fallback hoists from inside `LatestPosts` to inside the page. Engineer-confirmed loading states are sufficient. |
| Q1 — Read entry shape (service-direct vs. action-wrapper, ± `cacheTag`) | Resolved as service-direct + `'use cache'` + `cacheTag('posts')`. The "± `cacheTag`" framing collapsed: `cacheTag` only works inside `'use cache'`, and `'use cache'` and `'use server'` are mutually exclusive at the function level. See `decisions.md` → "Q1 resolved: cached service-direct read entry with `cacheTag('posts')`; `revalidateTag` invalidation". |
| Q2 — Pagination library | Shadcn `<Pagination>` over `react-headless-pagination`. See `decisions.md` → "Q2 resolved: Shadcn `<Pagination>` over `react-headless-pagination`". |
| Invalidation primitive selection | `revalidateTag('posts')` (bundled with `'use cache'` + `cacheTag` per Q1). The two `revalidatePath` calls in `deletePost` are removed. See `decisions.md` → "Q1 resolved: cached service-direct read entry with `cacheTag('posts')`; `revalidateTag` invalidation". |
| `FindAndCountPostsDto` shape | Replace outright in PR 2 (was PR 1 under the 3-PR plan) with a primitives constructor (`{ page, limit }`). The `Request`-based shape goes away in the same PR; the GET handler in PR 2 reads `searchParams` itself and passes primitives. See `decisions.md` → "DTO shape: replace outright in PR 1 (option c)" (numbering remapped under the 4-PR plan). |
| Backend cleanup (PR 4) — confirm GET handler has no other callers | Validated during Step 2 research pass: `useGetPaginatedPostsQuery` (`features/posts/hooks/useGetPaginatedPostsQuery.ts:18`) is the only `baseAPI.get` against `API_ROUTES.posts`. The `POST` caller (`features/posts/requests/postPostCreateRequest.ts:15`) is unaffected by PR 4. `app/api/posts/__tests__/GET.db.test.ts` and the `mockGetPostsResponse` helper in `test/servers/postsServer.ts` can be deleted alongside the route handler. |
| Page test rewrite (PR 3) | Use `vi.spyOn(PostService, 'findAndCount')` for `posts.page.test.tsx` and `latestPosts.test.tsx` — fast mocked-service branches, no DB. Integration coverage lives in `features/posts/actions/__tests__/getPosts.db.test.ts` (shipped in PR 2). See `architecture.md` § Testing Strategy → PR 3 tests. |
| `getPaginatedPosts` signature — no `limit`, awaited `searchParams` object | Implemented as `getPosts(searchParams: { page?: string })`. `limit` is not exposed at any public boundary. `FindAndCountPostsDto` receives `{ page?: string }` and handles all normalization via Zod. Action returns `currentPage` (normalized integer) alongside `posts`, `totalPages`, `error` so callers never re-derive it. See `decisions.md` → "`getPaginatedPosts` signature". |
| One component per file for pagination primitives | Engineer-specified during the 4-PR refinement. Each of the seven primitives lives in its own `<componentName>.tsx` with a co-located test; barrel `index.ts` re-exports the public surface. `<PaginationLink>` reuses `BUTTON_VARIANTS` rather than a parallel variants table. See `decisions.md` → "One component per file for pagination primitives". |
| Barrel export for pagination primitives | One directory per primitive under `globals/components/ui/`; each directory has its own `index.ts`; `globals/components/ui/index.ts` gains 7 new export lines. Consumers import from `@/globals/components/ui`. Consistent with `button/`, `heading/`, `spinner/`, `toaster/`. See `decisions.md` → "Barrel export: one directory per primitive, re-exported from `globals/components/ui/index.ts`". |
| Truncation logic placement principle | Extracted to `getTruncatedPageList.ts` (functional entry point for tests) which delegates to `globals/facades/PaginationFacade`. Logic was complex enough to warrant extraction. See `decisions.md` → "Truncation logic extracted to getTruncatedPageList + PaginationFacade". |
| `?page` beyond `totalPages` behavior | Option (a): leave as-is. Empty list → explicit empty-state message; `<Pagination>` still renders if `totalPages > 1`. See `decisions.md` → "Out-of-range `?page`: leave as-is (option a)". |
| Empty-state UX | Explicit `<p data-testid="latest-posts-empty">` in `PostCards` (not `LatestPosts`). `PostCards` guards with `if (!posts.length)`. See `decisions.md` → "Empty state moved to PostCards". |
| Page-list truncation spec (`totalPages=0` edge case) | `<Pagination>` self-collapses via `if (totalPages <= 1) return null`. `LatestPosts` renders `<Pagination>` unconditionally. See `decisions.md` → "totalPages <= 1 guard internalized in Pagination". |
| `deletePost` → `revalidateTag` swap (missed in PR 2) | Shipped in PR 3. Both `revalidatePath` calls removed; `revalidateTag(CACHE_TAGS.posts, {})` added. Second arg required by Next.js 16. `cacheTag: vi.fn()` added to `vitest.setup.tsx`. See `decisions.md` → "revalidateTag second argument (Next.js 16)" and "CACHE_TAGS constant". |
| `Pagination` primitive import aliasing | Done. `import { Pagination as PaginationNav, ... }` in `features/posts/components/pagination/pagination.tsx`. |
| Wrapper accessibility audit (PR 3) | Done. `aria-label="Posts pagination"`, `aria-disabled`, `pointer-events-none` boundary behavior, `aria-current="page"` on active link — all covered in `pagination.test.tsx`. |
| `LatestPosts` — do not destructure `getPosts` result upfront | Done. Pattern followed: `const result = await getPosts(...); if (result.error) { ... }; const { currentPage, posts, totalPages } = result`. |
| `features/posts/components/index.ts` — do NOT add `pagination` | Done. `Pagination` wrapper remains internal; `LatestPosts` imports via relative path `'../pagination'`. |
| Primitives accessibility audit (PR 1) | Confirmed shipped. Per-component tests in `globals/components/ui/*/` cover `aria-label`, `aria-current="page"`, `aria-label` on Previous/Next, `aria-hidden` on Ellipsis. |
