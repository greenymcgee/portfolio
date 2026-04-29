# Status — server-side-paginated-posts

| Field | Value |
| --- | --- |
| Created | 2026-04-27 |
| Last Updated | 2026-04-29 |
| Current Focus | PR 1 and PR 2 merged. PR 3 (frontend cutover) is next — see open todos for scope changes discovered post-merge. |

## Step Tracker

| Step | Name | State | Notes |
| --- | --- | --- | --- |
| 1 | Setup & Initial Plan | Complete | `inputs/requirements.md` (engineer-authored), `initial-plan.md`, `decisions.md`, `todos.md` all in sync. Constraints + design map intentionally skipped per requirements. Pattern shape and PR split locked after engineer corrections. |
| 2 | Architecture Document | Complete | `architecture.md` drafted. Q1 resolved (service-direct + `'use cache'` + `cacheTag('posts')` + `revalidateTag` invalidation; `cacheComponents: true` already enabled in `next.config.ts:6`). Q2 resolved (Shadcn `<Pagination>`). DTO shape resolved (replace outright in the backend-additive PR). 4 decision entries appended. |
| 3 | Iterative Refinement | Complete | All engineer-decision items resolved: out-of-range `?page` → leave as-is; empty-state → explicit message; `<Pagination>` renders only when `totalPages > 1` (collapses the truncation edge cases). 7 open items remaining — all implementation-time or low-priority. |
| 4 | Structure Architecture | Complete | 19 files in `plans/`: README, existing-implementation, proposed-solution, user-facing-behavior, data-models, security-considerations, testing-strategy, rollout-strategy, risks-open-questions, pr1-pagination-primitives/README, pr2-backend-additive/{README,action,dto,mutation}, pr3-frontend-cutover/{README,page,latest-posts,post-cards,pagination-wrapper}, pr4-backend-cleanup. |
| 5 | Engineering Review Prep | Complete | `review.md` created. |
| 6 | PR 1 — Pagination Primitives | **Shipped** | PR #136 merged. All 7 Shadcn primitives installed under `globals/components/ui/` with per-component directories, tests, and barrel exports. `globals/components/ui/index.ts` gains 7 export lines. |
| 7 | PR 2 — Backend Additive | **Shipped (partial)** | PR #137 merged. `getPosts` (not `getPaginatedPosts` — see notes below), DTO primitives constructor, GET handler updated. **`deletePost` swap to `revalidateTag` was NOT included** — moves to PR 3. |

## Inputs Present

- `inputs/requirements.md` ✓ (engineer)
- `inputs/constraints.md` — skipped (engineer-stated inline in `requirements.md` § Data & Fields → Constraints: "No additional constraints file is needed. This is a simple project."). See `decisions.md` → "Skip standalone constraints file".
- `inputs/design-map.md` — skipped (engineer-stated in `requirements.md` § Designs: "Status: Not needed"). See `decisions.md` → "Skip design map".

## Todo Progress

9 open items / 21 closed. Open items grouped by PR in `todos.md` (PR 3: 6 items; post-launch: 1 item; low-priority ongoing: 2 items). No engineer calls outstanding — all are implementation-time or low-priority.

## Notes for the Next Agent

- **PRs 1 and 2 are merged.** Start with `plans/pr3-frontend-cutover/README.md` for what's next.
- **PR 3 scope is larger than the plan shows.** The `deletePost.ts` → `revalidateTag('posts')` swap was missed in PR 2. It must ship in PR 3 — `revalidateTag` won't fire after deletes until it does. See `todos.md` → PR 3 section.
- **Action is named `getPosts`, not `getPaginatedPosts`.** File: `features/posts/actions/getPosts.ts`. Every plan reference to `getPaginatedPosts` means `getPosts`. Only the PR 3 plans have been updated to reflect the actual name; `architecture.md` and the PR 2 sub-docs still say `getPaginatedPosts` and are intentionally left as-is (historical record).
- **`getPosts` returns nulls on error, not zeros/empty arrays.** Actual error shape: `{ currentPage: null, error, posts: null, totalPages: null }`. This IS a proper discriminated union on `error: null`. In `LatestPosts`, do NOT destructure upfront — check `result.error` on the undestructured result to narrow the union, then destructure. See `plans/pr3-frontend-cutover/latest-posts.md` for the corrected code shape.
- **`Pagination` primitive name collision in the feature wrapper.** `features/posts/components/pagination/pagination.tsx` exports `Pagination` (feature wrapper). Inside that file, it also imports `Pagination` (primitive) from `@/globals/components/ui`. Resolve with an alias: `import { Pagination as PaginationNav, ... } from '@/globals/components/ui'`.
- **Async RSC test pattern.** Use `const jsx = await LatestPosts(props)` then `render(jsx)` — matching `features/posts/components/postPageContent/__tests__/postPageContent.test.tsx`. Do NOT use `await act(() => render(<LatestPosts />))`. The testing-strategy.md has been updated to reflect this.
- **4-PR sequence — current state:**
  1. ~~**PR 1**~~ — ✅ Merged (#136). All 7 Shadcn primitives in `globals/components/ui/`.
  2. ~~**PR 2**~~ — ✅ Merged (#137, partial). `getPosts` action, DTO primitives constructor, GET handler updated. `deletePost` swap missed.
  3. **PR 3** — *Next.* Sync page, async `LatestPosts`, `PostCards` props change, `useGetPaginatedPostsQuery` deletion, feature-level pagination wrapper, **plus `deletePost` → `revalidateTag` swap**.
  4. **PR 4** — Backend cleanup: delete `GET /api/posts` handler + tests + `mockGetPostsResponse` msw helper.
- **`getPosts` hard facts (load-bearing):**
  - `next.config.ts:6` has `cacheComponents: true`. No PR in this sequence touches `next.config.ts`.
  - `'use cache'` and `'use server'` are mutually exclusive. `getPosts.ts` has `'use cache'` and no `'use server'` anywhere. Don't add it.
  - `getPosts(searchParams: { page?: string })` is keyed by argument + tagged `'posts'`. `revalidateTag('posts')` invalidates every page-keyed entry in one call.
  - Both `revalidatePath` calls in `deletePost` must be removed in the same commit as the `revalidateTag` addition. Don't half-migrate.
  - `vitest.setup.tsx:16` already mocks `revalidateTag`. No test scaffolding changes needed.
- **Pattern shape locked** — `app/posts/page.tsx` stays sync, async data in `LatestPosts` (child RSC) inside `<Suspense>`, `searchParams` flows as `Promise<{ page?: string }>` awaited inside the child. Don't make the page async.
- **`createPost` is out of scope.** Don't fold it in.
- **No engineer calls outstanding.**
