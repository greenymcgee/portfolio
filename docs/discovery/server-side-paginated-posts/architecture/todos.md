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

### PR 2 — backend additive

- [ ] **`limit` is not sent from the frontend — decide whether to
      expose it in the `getPaginatedPosts` signature at all.**
      The engineer confirmed `limit` is extra scope for this project:
      no UI exists to change it and none will be added. The open call
      is whether `limit` stays as an optional param with a hardcoded
      default of `10` in both `getPaginatedPosts` and
      `FindAndCountPostsDto`, or is dropped from both public signatures
      entirely and hardcoded only inside the DTO. Whichever is chosen,
      the two signatures must be consistent. Resolve before PR 2 is
      written. `[engineer]`
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
| Barrel export for pagination primitives | One directory per primitive under `globals/components/ui/`; each directory has its own `index.ts`; `globals/components/ui/index.ts` gains 7 new export lines. Consumers import from `@/globals/components/ui`. Consistent with `button/`, `heading/`, `spinner/`, `toaster/`. See `decisions.md` → "Barrel export: one directory per primitive, re-exported from `globals/components/ui/index.ts`". |
| Truncation logic placement principle | Implementation-time call, made by the engineer during PR 3. Default inline; extract to `getTruncatedPageList.ts` if the logic sprawls. See `decisions.md` → "Truncation logic placement: implementation-time call". |
| `?page` beyond `totalPages` behavior | Option (a): leave as-is. Empty list → explicit empty-state message; `<Pagination>` still renders if `totalPages > 1`. See `decisions.md` → "Out-of-range `?page`: leave as-is (option a)". |
| Empty-state UX | Explicit `<p data-testid="latest-posts-empty">No posts on this page</p>` when `posts.length === 0`. `PostCards` only called when `posts.length > 0`. See `decisions.md` → "Empty-state UX: explicit message when `posts.length === 0`". |
| Page-list truncation spec (`totalPages=0` edge case) | `<Pagination>` renders only when `totalPages > 1`; `totalPages=0` and `totalPages=1` rows collapse into the no-render condition. Remaining table is complete in `architecture.md` → "Page-list truncation rule". See `decisions.md` → "Pagination renders only when `totalPages > 1`". |
