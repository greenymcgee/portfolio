# Todos — server-side-paginated-posts

> Items added by the skill are marked `[skill]`; engineer-added items are
> marked `[engineer]`. Resolved items move to `decisions.md` with
> rationale.

## Open

### PR 1 — pagination primitives

- [ ] **Primitives accessibility audit (PR 1).** Smoke-level a11y
      assertions inside the per-component test files in
      `globals/components/ui/pagination/__tests__/`:
      - `<Pagination>` renders `<nav>` with `aria-label` (default
        `"pagination"`, overridable via prop).
      - `<PaginationLink isActive={true}>` sets `aria-current="page"`;
        `isActive={false}` (default) omits it.
      - `<PaginationPrevious>` carries `aria-label="Go to previous
        page"` and renders the visible "Previous" text alongside
        `ChevronLeft`.
      - `<PaginationNext>` carries `aria-label="Go to next page"` and
        renders the visible "Next" text alongside `ChevronRight`.
      - `<PaginationEllipsis>` is `aria-hidden="true"` with SR-only
        "More pages" text.
      Acceptance: each primitive's `<componentName>.test.tsx` covers
      the relevant assertions. `[skill]`
- [ ] **`BUTTON_VARIANTS` reuse — confirm the variant compositions
      hold (PR 1).** During the PR 1 install, verify that
      `<PaginationLink>`'s active style (`outline` variant) and
      inactive style (`ghost` variant) at `size: 'icon-sm'` actually
      render correctly against the existing
      `globals/components/ui/button/constants.ts`. If the rendered
      box doesn't match the Shadcn reference closely enough, decide
      between (a) tightening the variant call (e.g., custom
      `className` pass-through), (b) introducing a small wrapper
      class, or (c) a parallel `PAGINATION_LINK_VARIANTS` only if
      `BUTTON_VARIANTS` truly can't express the visual. Default
      preference: stay on `BUTTON_VARIANTS` per the install-decision
      rationale. `[skill]`
- [ ] **Barrel export (`index.ts`) — discuss before PR 1 lands.**
      `architecture.md` (pagination primitives table) assumes
      `globals/components/ui/pagination/index.ts` re-exports all seven
      primitives, mirroring `globals/components/ui/button/index.ts`.
      Confirm with the team: keep the barrel vs. deep imports only;
      any bundler / tree-shaking preferences; consistency with other
      `globals/components/ui/*` folders. Resolution updates the table in
      `architecture.md` if the decision diverges from a barrel.
      `[engineer]`

### PR 2 — backend additive

- [ ] **`revalidatePath` removal — confirm no other callers rely on
      the path-based revalidation being removed from `deletePost`.**
      The change drops both `revalidatePath(ROUTES.post(state.id))` and
      `revalidatePath(ROUTES.posts)` calls. Run a final grep for
      `revalidatePath` in the codebase before PR 2 ships to confirm
      nothing else depends on these specific calls firing (e.g., a
      shared layout caching the navigation). `[skill]`
- [ ] **`getPaginatedPosts` arg shape — destructured `{ page, limit }`
      vs. positional `(page, limit)`.** Architecture went with
      destructured. Confirm during PR 2 implementation that this reads
      better at the call site (`getPaginatedPosts({ page })`) than the
      positional alternative. Low-risk, easy to flip if a code review
      surfaces a preference. `[skill]`
- [ ] **`'use cache'` request-scope deduplication — document
      behavior in JSDoc.** When `getPaginatedPosts({ page: 0 })` is
      called twice within the same request (e.g., from `LatestPosts`
      and from a hypothetical sibling RSC), Next.js's cache should
      serve the second call from the in-flight cache entry without
      re-running Prisma. Today only `LatestPosts` calls it, but if a
      future surface adds a second caller, we want the deduplication
      contract documented at the call site. Low-priority; document in
      JSDoc rather than test. `[skill]`

### PR 3 — frontend cutover

- [ ] **Wrapper accessibility audit (PR 3).** Pin down at the
      feature-level wrapper (`features/posts/components/pagination/`):
      - `<Pagination aria-label="Posts pagination">` on the outer
        element (overriding the primitive's default).
      - Keyboard navigation: tab through links works, Enter navigates,
        focus ring matches `Button`'s
        `focus-visible:ring-3 ring-ring/50`.
      - Boundary disable state — page 0 → "Previous" inert; last page
        → "Next" inert — implemented via `aria-disabled="true"` plus
        `pointer-events-none` so the link doesn't navigate.
      Acceptance: `pagination.test.tsx` (the wrapper test) covers
      each. `[skill]`
- [ ] **Page-list truncation spec — pin exact output across edge
      cases.** The architecture sketches "show first, prev, current ±
      1, next, last with ellipses." Before PR 3 ships, write a small
      table of expected `[<list>]` for representative inputs:
      - `(currentPage=0, totalPages=1)` → `[1]`
      - `(currentPage=0, totalPages=5)` → `[1,2,3,4,5]`
      - `(currentPage=0, totalPages=10)` → `[1,2,3,...,10]`
      - `(currentPage=4, totalPages=10)` → `[1,...,4,5,6,...,10]`
      - `(currentPage=9, totalPages=10)` → `[1,...,8,9,10]`
      - `(currentPage=N, totalPages=0)` → render nothing (or a single
        disabled "1"?) — engineer call.
      During PR 3 implementation, decide whether the truncation logic
      stays inline in `pagination.tsx` or extracts to
      `getTruncatedPageList.ts` per the placement-is-an-
      implementation-time-call decision (`decisions.md` →
      "Truncation logic placement: implementation-time call"). If
      extracted, table-driven assertions live in
      `getTruncatedPageList.test.ts`; otherwise they live in
      `pagination.test.tsx`. `[skill]`
- [ ] **Empty-state UX — keep the empty `<CardGroup>`, or add a "No
      posts yet" element?** The architecture currently says empty
      array → empty `<CardGroup>` (matches today's behavior, since
      the page is never empty in practice). If we're shipping
      pagination, a user could land on `?page=999` and see an empty
      page silently. Decide whether to render an explicit empty-state
      element (e.g., `<p data-testid="latest-posts-empty">No posts on
      this page</p>`) and keep the pagination control to navigate
      back, or leave the silent empty `<CardGroup>` as the MVP shape.
      `[skill]`
- [ ] **`?page` beyond `totalPages` — define behavior.** Today,
      requesting `?page=999` returns an empty `posts` array but
      `<Pagination>` still renders with the requested page
      highlighted. Decide:
      - (a) Leave as-is (empty list, pagination shows the requested
        page).
      - (b) Clamp `page` to `Math.min(requested, totalPages - 1)` in
        `LatestPosts` before calling `getPaginatedPosts`, so the
        pagination control reflects reality.
      - (c) Redirect to `/posts` (page 0) when out of range.
      Likely (a) for MVP, (b) is the cleanest UX; (c) is heavier.
      `[skill]`

### Post-launch

- [ ] **Cache lifetime — revisit post-launch.** Default `cacheLife`
      profile (5min stale / 15min revalidate / no expire) is the MVP
      choice. After PR 3 has soaked, check whether observed staleness
      is a complaint. If so, swap to `cacheLife({ stale: 60,
      revalidate: 300 })` or similar. Not a launch blocker. `[skill]`

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
| Page test rewrite (PR 3) | Use `vi.spyOn(PostService, 'findAndCount')` for `posts.page.test.tsx` and `latestPosts.test.tsx` — fast mocked-service branches, no DB. Integration coverage lives in the new `getPaginatedPosts.db.test.ts`. See `architecture.md` § Testing Strategy → PR 3 tests. |
| One component per file for pagination primitives | Engineer-specified during the 4-PR refinement. Each of the seven primitives lives in its own `<componentName>.tsx` with a co-located test; barrel `index.ts` re-exports the public surface. `<PaginationLink>` reuses `BUTTON_VARIANTS` rather than a parallel variants table. See `decisions.md` → "One component per file for pagination primitives". |
| Truncation logic placement principle | Implementation-time call, made by the engineer during PR 3. Default inline; extract to `getTruncatedPageList.ts` if the logic sprawls. See `decisions.md` → "Truncation logic placement: implementation-time call". (The truncation _spec_ — the table of expected outputs — remains open under PR 3.) |
