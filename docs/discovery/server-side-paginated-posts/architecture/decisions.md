# Decisions — server-side-paginated-posts

> Append-only log. Each entry: what was decided, why, alternatives
> considered, step it came from.

## 2026-04-27 — Skip design map

- **Decision:** No `inputs/design-map.md` will be created.
- **Why:** Engineer stated in `inputs/requirements.md` § Designs ("Status: Not needed", "Skip the design map for this project."). The work is a backend / data-flow migration plus a small functional pagination control; no Figma frame exists to map against.
- **Alternatives considered:** Scaffold an empty design map for future use — rejected as misleading; the architecture would advertise a designed surface that doesn't exist.
- **Step:** 1 — Setup & Initial Plan

## 2026-04-27 — Skip standalone constraints file

- **Decision:** No standalone `inputs/constraints.md`. Constraints are captured inline in `inputs/requirements.md` § Data & Fields → Constraints (no timeline, no third-party dependencies, no compliance requirements).
- **Why:** Engineer stated inline ("No additional constraints file is needed. This is a simple project.") and confirmed during Step 1 input gathering. Forcing a stub file would add ceremony with no extra signal.
- **Alternatives considered:** Scaffold the template stub anyway for symmetry with `fix-register-page` — rejected; the engineer's statement is the constraint, and the requirements file already enumerates the "no X" answers (no timeline, no dependencies, no compliance).
- **Step:** 1 — Setup & Initial Plan

## 2026-04-27 — Scope: read path only; `createPost` is a separate project

- **Decision:** This project replaces the read flow (`/posts` list page) and deletes the `GET /api/posts` route handler. `createPost` migration off `tryPostNewPost` / HTTP, and `POST /api/posts` deletion, are explicitly out of scope and will be tracked as a separate project.
- **Why:** Engineer-specified during Step 1 input gathering ("just delete the GET endpoint. create is another project"). The current pain point — `revalidatePath` not invalidating the client hook — is a read-side problem; replacing the read path closes it without entangling write-side migrations. Keeping scope tight also lets the backend PR land independently of the create-flow work.
- **Alternatives considered:** Migrate both read and write flows in this project — rejected per engineer; doubles the surface area and couples two separable concerns. Migrate read flow but leave the GET handler in place — rejected per engineer ("just delete the GET endpoint").
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Scope question raised during Step 1 input gathering ("just the list, list + GET deletion, or list + everything?"). Answer: list + GET deletion.

## 2026-04-27 — Pagination UI in scope, separate PR from backend

- **Decision:** A `?page=N`-driven pagination component is part of this project, but ships in a separate PR from the backend (read-path migration + cache invalidation). Library candidate: `react-headless-pagination` (engineer-flagged as known-good); alternatives still on the table for Step 2.
- **Why:** Engineer-specified during Step 1 input gathering ("we're going to build the UI, and that is going to be at least on separate PR from the backend. I've used `react-headless-pagination` before and had pretty decent results. Open to other suggestions that might work better."). The list page currently has no pagination control even though the data layer supports `page`/`limit`; without the UI, the read-flow migration can't be exercised end-to-end. Splitting backend / frontend keeps each PR reviewable on its own and avoids gating cache-invalidation work on UI library choice.
- **Alternatives considered:** Ship as a single PR — rejected per engineer ("at least on separate PR from the backend"). Skip the UI and keep `?page=N` driven only by manual URL editing — rejected; the requirements explicitly describe a pagination-list UX (`requirements.md` Flow 1 step 3, Flow 4).
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Pagination-UI scope question raised during Step 1 (no pagination component exists in the codebase today).
- **Refined by:** "Ship plan: 3 PRs with strict backend / frontend separation" (same day) — the original "separate PR from backend" framing becomes a 3-PR split (additive backend, frontend cutover, backend cleanup).

## 2026-04-27 — Defer read-pattern decision to Step 2

- **Decision:** Choosing between (a) async Server Component direct call to `PostService.findAndCount`, (b) server-action wrapper invoked from an async Server Component, or (c) either + `'use cache'` / `cacheTag('posts')` is deferred to Step 2's architecture pass. The initial plan documents all three as feasible without committing.
- **Why:** Engineer-specified during Step 1 input gathering ("Let's do more research, and then we'll make the call"). The choice has cache-invalidation implications (Q1 in `todos.md`) that deserve a focused look at Next.js 16.1.6's `next/cache` semantics — particularly how `revalidatePath('/posts', 'page')` interacts with `?page=N` variants vs. how `revalidateTag('posts')` does — before being baked into the architecture.
- **Alternatives considered:** Commit to one option now — rejected per engineer; want research first.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Initial-plan write-time decision pressure; the question persists as Q1 in `todos.md` and is the marquee item for Step 2.
- **Refined by:** "Page stays non-async; async-child-in-Suspense pattern" (same day) — narrows Q1 from three patterns to two pattern variants (service-direct vs. action-wrapper, plus the `cacheTag` opt-in). The async-Server-Component shape itself is no longer optional.

## 2026-04-27 — Page stays non-async; async-child-in-Suspense pattern

- **Decision:** `app/posts/page.tsx` stays a synchronous Server Component. The static header (`'Round the Corner` heading + typewriter background) renders immediately. Data fetching happens inside an async Server Component (the rewritten `LatestPosts`) wrapped in `<Suspense>` on the page. `searchParams` is passed through as a `Promise<{ page?: string }>` and awaited inside the async child — the page never awaits it.
- **Why:** Engineer-specified ("We're definitely not going with any approaches that make the entire page an async function. We can at least render the header static. That's the point of this research and implementation is to learn the async component pattern that doesn't require the page to be async."). Pattern is the explicit research goal of the project. Existing precedent in the codebase: `app/posts/[id]/page.tsx` already uses the same shape — sync `PostPage` wrapping `<Suspense>` around async `PostPageContent`, which awaits `params: Promise<{ id: number }>`. Applying the same shape to `searchParams` on the list page extends the pattern, doesn't invent it.
- **Alternatives considered:** Make `app/posts/page.tsx` async and read `searchParams` directly in the page — rejected per engineer; blocks the static header on the data fetch and defeats the partial-prerender / streaming benefit. Move the data fetch into a Client Component that calls a server action — rejected; doesn't teach the async-Server-Component pattern, regresses to client-state caching (the same problem this project exists to fix).
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Locked-in read-pattern shape (the "where does the async live" question). Q1 in `todos.md` narrows to the orthogonal "service-direct vs. action-wrapper, with or without `cacheTag`" question.

## 2026-04-27 — Ship plan: 3 PRs with strict backend / frontend separation

- **Decision:** The work ships as three separate PRs, with no PR mixing backend and frontend changes:
  1. **PR 1 — Backend, additive only.** New `getPaginatedPosts` read entry (action or service-direct, per Q1); DTO change so it accepts `{ page, limit }` primitives; `deletePost` updated to use the chosen invalidation primitive; tests for the new code. The `GET /api/posts` handler stays. Nothing under `app/posts/`, `features/posts/components/`, or `features/posts/hooks/` is touched.
  2. **PR 2 — Frontend, cutover.** `app/posts/page.tsx` rewritten as a sync page with `<Suspense>` around a new async `LatestPosts`. `PostCards` props shift to `{ posts }`. Delete `useGetPaginatedPostsQuery` + tests + `PaginatedPostsQuery` type. New pagination component (per Q2). Updated `posts.page.test.tsx`. Nothing under `app/api/posts/`, `features/posts/post.{service,repository}.ts`, or `features/posts/dto/` is touched.
  3. **PR 3 — Backend cleanup.** Delete `app/api/posts/route.ts` GET handler, `app/api/posts/__tests__/GET.db.test.ts`, and the msw `mockGetPostsResponse` helper. Preserve the POST scaffolding for `createPost` (still HTTP, separate project). Pure deletion — no frontend touched.
- **Why:** Engineer-specified ("the backend PR includes frontend changes. That's not acceptable"). Strict per-PR separation keeps each PR reviewable in its own domain (data/cache reviewer for PR 1 and PR 3; UI reviewer for PR 2) and prevents the kind of accidental coupling that made the original 2-PR proposal mix backend and frontend in PR 1. Three PRs land sequentially: PR 1 introduces the new read entry while the old GET handler still works; PR 2 cuts the frontend over to the new entry; PR 3 deletes the now-dead handler.
- **Alternatives considered:** 2 PRs with PR 3 folded into PR 2 — rejected; folding a backend deletion (route handler + handler tests + msw mocks) into a frontend cutover PR violates the same separation principle that drove this whole reframe. 1 PR shipping everything atomically — rejected per engineer's two earlier directives ("at least on separate PR from the backend"; "the backend PR includes frontend changes. That's not acceptable").
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** PR shape and sequencing.
- **Supersedes:** The "separate PR from the backend" framing in "Pagination UI in scope, separate PR from backend" — refines the 2-PR sketch into the 3-PR ship plan above.
