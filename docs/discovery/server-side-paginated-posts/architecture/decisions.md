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

## 2026-04-27 — Q1 resolved: cached service-direct read entry with `cacheTag('posts')`; `revalidateTag` invalidation

- **Decision:** The new read entry is a server-side function at `features/posts/actions/getPaginatedPosts.ts` that opens with `'use cache'`, calls `cacheTag('posts')`, and invokes `PostService.findAndCount(new FindAndCountPostsDto({ page, limit }))`. **No `'use server'` directive** — `'use cache'` and `'use server'` are mutually exclusive at the function level, and we want caching. `deletePost` invalidates with `revalidateTag('posts')` (replacing the two `revalidatePath` calls). `cacheLife` stays at the default profile.
- **Why:** The marquee Step-2 question. The research-pass findings against the Next.js 16.1.6 docs landed three constraints that resolve the option space cleanly:
  1. **`'use cache'` is GA in 16.0.0+** ([directive reference](https://nextjs.org/docs/app/api-reference/directives/use-cache) "Version History" table). R4 from `initial-plan.md` resolved.
  2. **`cacheComponents: true` is required** for `'use cache'` to function — and it's already set in `next.config.ts:6`. The portfolio is already running under the explicit-opt-in caching model. No app-wide flag flip needed.
  3. **`cacheTag` only works inside `'use cache'`** — the original "± `cacheTag`" framing in the todo collapses; tag-based invalidation is bundled with the directive choice, not orthogonal.
  4. **`'use cache'` and `'use server'` are mutually exclusive** at the function level — caching forces service-direct (eliminates the action-wrapper sub-option from Q1).
  5. **`'use cache'` cannot read `searchParams`/`cookies`/`headers` directly**; values must be passed as arguments. This is exactly the DTO-primitives shape we already need (`{ page, limit }`), so it costs us nothing.
  Tag-based invalidation is the architectural fit for the requirements: `revalidateTag('posts')` invalidates every cached `{ page, limit }` entry tagged `'posts'` in one call, fanning across all `?page=N` variants. That's the property `revalidatePath` cannot give us cleanly (per the Next.js 16 docs, query strings aren't supported in `revalidatePath`, and `revalidatePath('/posts', 'page')` operates on the route's render cache, not on tagged data caches). The research goal — "engineer has a good understanding of caching in Next.js 16" — is satisfied by the directive + tag combination, not by the no-cache options.
- **Alternatives considered:**
  - **Option A: Service-direct, no caching, `revalidatePath('/posts', 'page')`.** Rejected. Doesn't exercise the caching primitives. The user-facing pain ("hook doesn't invalidate") goes away with any server-side read regardless of cache layer, but the research goal explicitly demands the caching primitives. Skipping them defeats the project's purpose.
  - **Option B: `getPaginatedPosts` as a `'use server'` action, no caching.** Rejected. Mirrors `getPost` symmetrically but adds a `'use server'` marshalling boundary that's an anti-pattern for read paths called only from RSCs (per Vercel guidance). Also doesn't exercise caching.
  - **Option D: `unstable_cache(fn, [keyParts], { tags: ['posts'] })`.** Rejected. Same invalidation model as Option C, but uses an `unstable_*` API that the Next.js 16 docs route around. Adopting `unstable_cache` now means migrating to `'use cache'` later — committing to the deprecated path is a downgrade with no compensating benefit.
  - **Tag granularity: per-page tags (`'posts:page:N'`) or hierarchical tags.** Rejected. Adds key-management overhead with no win — every mutation invalidates the whole list anyway (delete affects ordering across all pages). One coarse tag is the right granularity.
  - **`cacheLife({ revalidate: 60 })` or tighter.** Deferred. Default profile (5min stale / 15min revalidate) is fine for a portfolio. Tighten only if observed staleness becomes a complaint.
- **Step:** 2 — Architecture Document
- **Resolves:** Q1 (read-entry shape + invalidation primitive) and the orthogonal "± `cacheTag`" sub-question, which the research pass collapsed into a single decision.
- **Refines:** "Defer read-pattern decision to Step 2" (2026-04-27, Step 1).

## 2026-04-27 — Q2 resolved: Shadcn `<Pagination>` over `react-headless-pagination`

- **Decision:** Pagination ships as a Shadcn `<Pagination>` copy-paste install at `globals/components/ui/pagination/`, wrapped by a feature-level component at `features/posts/components/pagination/pagination.tsx` that accepts `{ currentPage, totalPages }` and renders Shadcn primitives with `next/link` items. Page list logic: show all if `totalPages <= 7`, else `[1, ..., page-1, page, page+1, ..., last]` with ellipses for non-adjacent gaps.
- **Why:** Shadcn aligns with the codebase's `cn` + `cva` + `data-slot` patterns (`globals/components/ui/button/button.tsx`); ships with `next/link` integration; no `package.json` churn (copy-paste install, not a dep). The engineer's "decent results with `react-headless-pagination`" is a softer endorsement than "uses the exact primitives the rest of the app uses." The feature-level wrapper keeps `globals/components/ui/pagination/` route-agnostic for future paginated surfaces.
- **Alternatives considered:**
  - **`react-headless-pagination`** (engineer-flagged) — rejected. New dependency, headless-only (paint layer ours), no `next/link` integration out of the box. Would need its own wrapper to match Shadcn's visual conventions, which is exactly what Shadcn's primitive already is.
  - **Custom ~50 LOC headless component.** Rejected. Slightly more code than Shadcn's primitive, and we'd reinvent the page-list-with-ellipses logic. Shadcn ships it.
- **Step:** 2 — Architecture Document
- **Resolves:** Q2 (pagination library).
- **Refines:** "Pagination UI in scope, separate PR from backend" (2026-04-27, Step 1).

## 2026-04-27 — DTO shape: replace outright in PR 1 (option c)

- **Decision:** `FindAndCountPostsDto`'s `Request`-based constructor is replaced outright in PR 1 with a primitives constructor: `constructor({ page, limit }: { page: number; limit?: number })`. The Zod schema (`findAndCountPostsSchema`) and validation flow are unchanged — `coerce.number()` accepts both string and number inputs. PR 1 also updates `app/api/posts/route.ts`'s `GET` handler to extract `searchParams` itself and pass primitives to the DTO; PR 3 then deletes the handler outright.
- **Why:** The `Request`-based shape is dead code in the steady state — its only caller is the GET handler, and PR 3 deletes that handler. Carrying a transitional dual-mode DTO across PR 1 → PR 2 → PR 3 for code that's deleted three PRs later is more ceremony than the tradeoff is worth. Replacing outright in PR 1 also avoids two distinct DTO shapes coexisting on `main` between PR 1 and PR 3.
- **Alternatives considered:**
  - **(a) Widen DTO to accept both `Request` and primitives.** Rejected — adds runtime type-narrowing (`if (input instanceof Request)`) for code that's deleted within the same project's PR sequence.
  - **(b) Sibling `FindAndCountPostsParamsDto` for the in-process path.** Rejected — same reasoning. Two DTOs for the same operation are confusing; the second one becomes the canonical shape and the original becomes dead weight.
- **Step:** 2 — Architecture Document
- **Resolves:** "FindAndCountPostsDto shape" todo.
- **Superseded numbering by:** "Ship plan refined to 4 PRs" (2026-04-27, Step 3) — the decision still holds, but DTO replacement now lands in PR 2 (backend additive) and the GET handler is deleted in PR 4 (backend cleanup). Read "PR 1" in the body above as "PR 2" and "PR 3" as "PR 4" against the 4-PR plan.

## 2026-04-27 — Ship plan refined to 4 PRs (pagination install carve-out)

- **Decision:** The 3-PR ship plan is refined to a 4-PR sequence by carving the pagination component install into its own PR ahead of the backend work:
  1. **PR 1 — Pagination primitives.** Shadcn `<Pagination>` install at `globals/components/ui/pagination/` (one component per file), per-component smoke tests, no consumer yet.
  2. **PR 2 — Backend, additive only.** (Was PR 1 in the 3-PR plan.) `getPaginatedPosts` read entry, DTO primitives constructor, `deletePost` swap to `revalidateTag('posts')`, GET handler updated to pass primitives.
  3. **PR 3 — Frontend, cutover.** (Was PR 2 in the 3-PR plan.) Sync page + async `LatestPosts`, `PostCards` props change, `useGetPaginatedPostsQuery` deletion, feature-level pagination wrapper at `features/posts/components/pagination/`.
  4. **PR 4 — Backend cleanup.** (Was PR 3 in the 3-PR plan.) Delete `GET /api/posts` route handler, its tests, and the `mockGetPostsResponse` msw helper.
- **Why:** Engineer-specified ("We're going to include a PR dedicated to installing and testing the pagination components. The one component per file rule will be followed."). Reasoning:
  - The pagination primitives are a self-contained Shadcn install. They don't depend on any of the read-path migration work and aren't depended on by the backend PR. Shipping them separately means PR 3's diff is purely about the read-path migration and the feature-level wrapper, not about reviewing seven new UI primitive files at the same time.
  - Pagination-first ordering (vs. pagination-last) was chosen so PR 3 imports already-merged primitives instead of pulling them in alongside the cutover. Reviewers of PR 3 see a single concern: the read-path migration. Reviewers of PR 1 see a single concern: are the primitives correct, accessible, and consistent with the rest of `globals/components/ui/`.
  - Primitive-level test failures in PR 1 don't block the cutover review in PR 3.
- **Alternatives considered:**
  - **3-PR plan, primitives folded into the cutover PR.** Rejected per engineer; mixes UI-primitive review with read-path migration review.
  - **4-PR plan with pagination as PR 4 (last).** Rejected — would mean PR 3 ships the cutover with no pagination UI, then PR 4 retrofits it. Either the cutover renders nothing where pagination should be, or the cutover hand-rolls a placeholder that PR 4 deletes. Both are worse than landing primitives first.
- **Step:** 3 — Approval & Refinement
- **Resolves:** PR ordering question raised when the install carve-out was introduced.
- **Supersedes:** "Ship plan: 3 PRs with strict backend / frontend separation" (2026-04-27, Step 1) — the strict backend / frontend separation principle still holds; the plan now adds a primitives-only PR ahead of the backend work and renumbers the rest accordingly.

## 2026-04-27 — One component per file for pagination primitives

- **Decision:** Shadcn's `<Pagination>` install is split one-component-per-file under `globals/components/ui/pagination/`. The seven primitives (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`) each live in their own `<componentName>.tsx` file, with a co-located test in `__tests__/<componentName>.test.tsx` and a barrel `index.ts` re-exporting the public surface. `<PaginationLink>` reuses `BUTTON_VARIANTS` from `globals/components/ui/button/constants.ts` rather than introducing a new `pagination/constants.ts`.
- **Why:** Engineer-specified ("The one component per file rule will be followed"), and consistent with every existing Shadcn-style install in `globals/components/ui/` (`button/`, `heading/`, `spinner/`, `toaster/` all follow this shape). Reusing `BUTTON_VARIANTS` for `<PaginationLink>` matches Shadcn's own reference (which calls `buttonVariants(...)` for active/inactive link styling) and keeps the codebase from diverging into two near-identical variant tables.
- **Alternatives considered:**
  - **Single `pagination.tsx` exporting all seven primitives.** Rejected per engineer; violates the established convention and makes per-component test discovery awkward.
  - **Define a parallel `PAGINATION_LINK_VARIANTS` mirroring `BUTTON_VARIANTS`.** Rejected — the Shadcn reference itself uses `buttonVariants`, and the active/inactive styling we need (`outline` vs. `ghost` + `icon-sm`) is already expressible against `BUTTON_VARIANTS`. Defining a parallel table is duplication for no benefit.
- **Step:** 3 — Approval & Refinement
- **Resolves:** File-organization question for the pagination install.

## 2026-04-27 — Barrel export: one directory per primitive, re-exported from `globals/components/ui/index.ts`

- **Decision:** Each of the 7 pagination primitives gets its own directory under `globals/components/ui/` (`pagination/`, `paginationContent/`, `paginationItem/`, `paginationLink/`, `paginationPrevious/`, `paginationNext/`, `paginationEllipsis/`). Each directory has its own `<componentName>.tsx`, `index.ts`, and `__tests__/<componentName>.test.tsx`. `globals/components/ui/index.ts` gains 7 new `export * from './<componentName>'` lines. Consumers import from `@/globals/components/ui` — no deep imports.
- **Why:** Engineer-confirmed ("the pattern is one component per directory. And then the barrel export from ui/index.ts yes."). Consistent with every existing `globals/components/ui/` folder (`button/`, `heading/`, `spinner/`, `toaster/`), all of which follow the same one-directory-per-component shape with a subfolder `index.ts` and a top-level re-export. All 7 existing consumers import from `@/globals/components/ui`; no deep-import precedent exists in the codebase.
- **Alternatives considered:** All 7 primitives in a single shared `globals/components/ui/pagination/` directory with one barrel — rejected; violates the one-component-per-directory convention. Deep imports only (no sub-barrel) — rejected; no precedent in the codebase and requires consumers to know file paths inside the primitive folder.
- **Step:** 3 — Iterative Refinement
- **Resolves:** "Barrel export (`index.ts`) — discuss before PR 1 lands" todo. Also supersedes the architecture's earlier assumption of a shared `pagination/` directory for all 7 primitives.

## 2026-04-27 — Truncation logic placement: implementation-time call

- **Decision:** The page-list truncation logic in the feature-level pagination wrapper starts inline inside `pagination.tsx`. If during PR 3 implementation it grows beyond a few clear branches, the implementer extracts it to a sibling pure utility at `features/posts/components/pagination/getTruncatedPageList.ts` with its own `__tests__/getTruncatedPageList.test.ts`. The "complicated enough to extract" call is made by the implementer at PR-write time; this decision is the principle, not a line-count threshold.
- **Why:** Engineer-specified ("It depends on how complicated the util is. If complicated we move it to a util, but if the concern makes more sense in the component we keep it there."). The truncation rule is small enough on the happy path (`totalPages <= 7` → render all; else windowed list with ellipses) that an inline implementation is plausible, but boundary handling (currentPage at 0 or `totalPages - 1`, ellipsis-collapse, off-by-ones) can balloon it. Premature extraction adds a file with no real separation-of-concerns win; premature inlining buries logic that wants its own pure-function tests. The right call depends on what the function looks like once written, so the architecture defers it to PR 3 instead of guessing now.
- **Alternatives considered:**
  - **Always extract** — rejected; one-file overhead for what may be 8 lines of logic.
  - **Always inline** — rejected; punishes the case where the logic genuinely sprawls and wants pure-function tests.
  - **Pin a line-count threshold** (e.g., "extract if > 30 LOC"). Rejected; a clean 35-line function and a tangled 25-line function should land on opposite sides of this call. Engineer judgment at write-time is the right arbiter.
- **Step:** 3 — Approval & Refinement
- **Resolves:** "Truncation utility placement" question raised during the 4-PR refinement.
