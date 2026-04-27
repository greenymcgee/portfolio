# Status — server-side-paginated-posts

| Field | Value |
| --- | --- |
| Created | 2026-04-27 |
| Last Updated | 2026-04-27 |
| Current Focus | Step 2 — Architecture Document. Async-Server-Component shape is locked (page stays sync, async data fetch in child inside `<Suspense>`). 3-PR ship plan is locked. Step 2's marquee questions are Q1 (service-direct vs. action-wrapper, ± `cacheTag`) and Q2 (pagination library) — both deferred from Step 1 pending Next.js 16.1.6 caching research. |

## Step Tracker

| Step | Name | State | Notes |
| --- | --- | --- | --- |
| 1 | Setup & Initial Plan | Complete | `inputs/requirements.md` (engineer-authored), `initial_plan.md`, `decisions.md`, `todos.md` all in sync. Constraints + design map intentionally skipped per requirements. Pattern shape and PR split locked after engineer corrections. |
| 2 | Architecture Document | Not Started | Will resolve Q1/Q2 + draft `architecture.md` |
| 3 | Iterative Refinement | Not Started | — |
| 4 | Structure Architecture | Not Started | — |
| 5 | Engineering Review Prep | Not Started | — |

## Inputs Present

- `inputs/requirements.md` ✓ (engineer)
- `inputs/constraints.md` — skipped (engineer-stated inline in `requirements.md` § Data & Fields → Constraints: "No additional constraints file is needed. This is a simple project."). See `decisions.md` → "Skip standalone constraints file".
- `inputs/design-map.md` — skipped (engineer-stated in `requirements.md` § Designs: "Status: Not needed"). See `decisions.md` → "Skip design map".

## Todo Progress

6 open Step-2-blocking items in `todos.md` (Q1, Q2, and 4 downstream specifics that crystallize once Q1 lands). 8 closed during Step 1, including two engineer corrections that landed late: page-must-stay-non-async and the 3-PR ship plan.

## Notes for the Next Agent

- **Pattern shape is locked, not optional.** `app/posts/page.tsx` stays a synchronous Server Component that renders the static header and wraps an async `LatestPosts` in `<Suspense>`. `searchParams` flows through as `Promise<{ page?: string }>` and is awaited inside the async child — never inside the page. The canonical reference is `app/posts/[id]/page.tsx` + `features/posts/components/postPageContent/postPageContent.tsx` (already in the codebase). The whole research goal of this project is to internalize this pattern; do not propose making the page async.
- **3 PRs, strict backend / frontend separation.** PR 1 = additive backend (new read entry + DTO + `deletePost` invalidation update). PR 2 = frontend cutover (page rewrite + `LatestPosts` rewrite + `PostCards` shape change + hook deletion + pagination UI). PR 3 = backend cleanup (delete `GET /api/posts` route + tests + msw GET helpers). PR 1 cannot include frontend changes; PR 3 cannot include frontend changes; PR 2 cannot delete route handlers. This was an engineer correction late in Step 1 — do not regress it.
- **`createPost` and `POST /api/posts` are out of scope.** Don't fold their migration into this work even if it looks tempting while editing adjacent files (`features/posts/actions/createPost.ts`, `features/posts/utils/tryPostNewPost.ts`, the POST half of `app/api/posts/route.ts`). The msw POST scaffolding survives PR 3.
- `deletePost`'s redirect to `/posts` (which strips query params and lands the user on page 1) is intentional per `requirements.md` Flow 4 — "Admin User is taken back to the posts page **and clicks on page 2**" describes manual re-navigate. Don't change it.
- **Next.js 16 caching primitives are the heart of Q1.** Read `next/cache` docs at the version pinned in `package.json` (16.1.6) before drafting Step 2 — primitives have moved across minor versions, and the difference between `revalidatePath('/posts', 'page')` and `revalidateTag('posts')` is the entire invalidation decision. Validate `'use cache'` GA status in 16.1.6 before recommending it; fall back to `unstable_cache` + `cacheTag` if the directive is still experimental.
- `FindAndCountPostsDto` currently takes a `Request`. The new read entry needs `{ page, limit }` primitives. The `Request`-based shape becomes dead code after PR 3 — could be replaced outright in PR 1 rather than widened. Tracked in `todos.md`.
