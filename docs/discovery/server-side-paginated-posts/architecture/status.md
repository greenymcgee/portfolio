# Status — server-side-paginated-posts

| Field | Value |
| --- | --- |
| Created | 2026-04-27 |
| Last Updated | 2026-04-27 |
| Current Focus | Step 3 — Iterative Refinement. `architecture.md` is drafted with Q1 and Q2 both resolved and the ship plan refined to **4 PRs** (pagination primitives → backend additive → frontend cutover → backend cleanup). 10 open refinement items in `todos.md`, organized by PR. Ready to work refinement items conversationally. |

## Step Tracker

| Step | Name | State | Notes |
| --- | --- | --- | --- |
| 1 | Setup & Initial Plan | Complete | `inputs/requirements.md` (engineer-authored), `initial-plan.md`, `decisions.md`, `todos.md` all in sync. Constraints + design map intentionally skipped per requirements. Pattern shape and PR split locked after engineer corrections. |
| 2 | Architecture Document | Complete | `architecture.md` drafted. Q1 resolved (service-direct + `'use cache'` + `cacheTag('posts')` + `revalidateTag` invalidation; `cacheComponents: true` already enabled in `next.config.ts:6`). Q2 resolved (Shadcn `<Pagination>`). DTO shape resolved (replace outright in the backend-additive PR). 4 decision entries appended. |
| 3 | Iterative Refinement | In Progress | Ship plan refined from 3 PRs to 4 PRs (pagination install carved out into its own PR ahead of the backend work). One-component-per-file rule reaffirmed for the primitives install. Truncation logic placement is an implementation-time call. 10 open refinement items in `todos.md`. |
| 4 | Structure Architecture | Not Started | — |
| 5 | Engineering Review Prep | Not Started | — |

## Inputs Present

- `inputs/requirements.md` ✓ (engineer)
- `inputs/constraints.md` — skipped (engineer-stated inline in `requirements.md` § Data & Fields → Constraints: "No additional constraints file is needed. This is a simple project."). See `decisions.md` → "Skip standalone constraints file".
- `inputs/design-map.md` — skipped (engineer-stated in `requirements.md` § Designs: "Status: Not needed"). See `decisions.md` → "Skip design map".

## Todo Progress

10 open refinement items / 14 closed. Open items are now grouped by PR in `todos.md` (PR 1: 3 items; PR 2: 3 items; PR 3: 4 items; post-launch: 1 item).

## Notes for the Next Agent

- **Architecture is monolithic, not yet structured.** `architecture.md` is the active working copy for Step 3 refinement. Don't try to read `plans/` — Step 4 (structure architecture) hasn't run.
- **4-PR sequence (pagination first):**
  1. **PR 1** — Shadcn `<Pagination>` primitives install at `globals/components/ui/pagination/`, one component per file, with per-component smoke tests. Reuses `BUTTON_VARIANTS`. No consumer yet.
  2. **PR 2** — Backend additive: `getPaginatedPosts` (`'use cache'` + `cacheTag('posts')`), `FindAndCountPostsDto` primitives constructor, `deletePost` swap to `revalidateTag('posts')`, GET handler updated to pass primitives.
  3. **PR 3** — Frontend cutover: sync page + async `LatestPosts`, `PostCards` props change, `useGetPaginatedPostsQuery` deletion, feature-level pagination wrapper at `features/posts/components/pagination/`.
  4. **PR 4** — Backend cleanup: delete `GET /api/posts` route handler + tests + `mockGetPostsResponse` msw helper.
- **Step 2 hard facts to keep load-bearing:**
  - `next.config.ts:6` already has `cacheComponents: true`. No PR in this sequence touches `next.config.ts`.
  - `'use cache'` and `'use server'` are mutually exclusive at the function level. `getPaginatedPosts.ts` opens the function with `'use cache'` and **does not** carry `'use server'` at the file or function level. Don't accidentally regress it to a server action — caching is the entire point of the read entry shape.
  - `getPaginatedPosts({ page, limit })` is keyed by `{ page, limit }` and tagged `'posts'`. `revalidateTag('posts')` invalidates every page-keyed entry in one call.
  - The two `revalidatePath` calls in `deletePost` are **both** removed in favor of a single `revalidateTag('posts')`. Don't half-migrate.
  - `vitest.setup.tsx:16` already mocks `revalidateTag`. Test scaffolding is unchanged for the invalidation swap.
- **Pattern shape is still locked** — `app/posts/page.tsx` stays sync, async data fetch in `LatestPosts` (a child RSC) inside `<Suspense>`, `searchParams` flows through as `Promise<{ page?: string }>` and is awaited inside the async child. The architecture honors this; don't propose making the page async.
- **One-component-per-file rule for the pagination primitives install** is engineer-specified. Each of the seven Shadcn primitives gets its own `<componentName>.tsx` file under `globals/components/ui/pagination/` with a co-located test in `__tests__/`. `<PaginationLink>` reuses `BUTTON_VARIANTS` rather than introducing a parallel variants table.
- **Truncation logic placement is an implementation-time call**, not a Step-3 decision. Default: keep the page-list computation inline in the wrapper. If during PR 3 implementation it sprawls (boundary handling, ellipsis collapse, off-by-ones), extract to a sibling pure utility (`features/posts/components/pagination/getTruncatedPageList.ts`) with its own tests. The "complicated enough to extract" judgment is the implementer's at write-time.
- **Backend / frontend separation is still non-negotiable** per the engineer's earlier correction. The 4-PR plan preserves it; primitives in PR 1 are pure UI, PR 2 is pure backend, PR 3 is the cutover, PR 4 is pure backend deletion.
- **`createPost` is still out of scope.** Don't fold it into this work.
- **Open refinement items by PR** (full text in `todos.md`):
  - **PR 1:** primitives a11y assertions in the per-component tests; `BUTTON_VARIANTS` reuse sanity check; barrel `index.ts` discussion (see `todos.md`).
  - **PR 2:** `revalidatePath` removal grep; `getPaginatedPosts` arg shape; `'use cache'` request-scope deduplication doc.
  - **PR 3:** wrapper a11y; page-list truncation spec table (drives where the logic lives); empty-state UX call; `?page > totalPages` behavior call.
  - **Post-launch:** revisit `cacheLife`.
- **Items needing an engineer call before implementation starts:** truncation spec table (PR 3), empty-state UX (PR 3), out-of-range `?page` behavior (PR 3). The rest can be resolved during PR-write.
