# Initial Plan — server-side-paginated-posts

> Step 1 output. Analysis only — no code. See `inputs/requirements.md`
> for source-of-truth. Decisions log: `decisions.md`. Open architecture
> questions: `todos.md`.

## Goal

Replace the client-side `useGetPaginatedPostsQuery` hook (which fetches
`GET /api/posts?page=N` via `baseAPI`) with a **server-rendered list
delivered through an async Server Component nested inside a `<Suspense>`
boundary on a synchronous page**. The page itself stays non-async so the
static header (`'Round the Corner` heading + typewriter background)
renders immediately while the data-fetching child suspends; the whole
list participates in Next.js 16's server cache, so `revalidatePath` /
`revalidateTag` calls from `deletePost` (and future mutations)
invalidate every admin's view across every paginated variant. Add a
`?page=N`-driven pagination UI. Delete the `app/api/posts/route.ts`
GET handler once nothing in the app calls it.

The shape mirrors `app/posts/[id]/page.tsx` + `PostPageContent` — the
canonical "sync page + async child in Suspense" reference already in
the codebase. The research goal is to internalize that pattern as the
default for server-driven, cache-invalidatable read flows.

`createPost` migration off `tryPostNewPost` / HTTP, and `POST
/api/posts` deletion, are explicitly **out of scope** (separate
project — see `decisions.md` → "Scope: read path only; `createPost` is
a separate project").

## Ship Plan: 3 PRs, strict backend / frontend separation

| PR | Scope | What lands | What does not |
| --- | --- | --- | --- |
| 1 | Backend, additive | New `getPaginatedPosts` read entry (action or service-direct, per Q1); DTO change so it accepts `{ page, limit }` primitives; `deletePost` updated to use the chosen invalidation primitive; tests for new code | No `app/posts/`, no `features/posts/components/`, no `features/posts/hooks/` changes. The `GET /api/posts` handler stays. |
| 2 | Frontend, cutover | Sync `app/posts/page.tsx` with static header + `<Suspense>` around an async `LatestPosts`; `PostCards` shape change to `{ posts }`; delete `useGetPaginatedPostsQuery` + tests + `PaginatedPostsQuery` type; new pagination component; updated `posts.page.test.tsx` | No `app/api/posts/`, no `features/posts/post.{service,repository}.ts`, no `features/posts/dto/` changes (those landed in PR 1). |
| 3 | Backend cleanup | Delete `app/api/posts/route.ts` GET handler, `app/api/posts/__tests__/GET.db.test.ts`, and the msw `mockGetPostsResponse` helper. Preserve the POST scaffolding (`createPost` is still HTTP). | No frontend touched. Pure deletion. |

The split is firm: PR 1 cannot include frontend changes; PR 3 cannot
include frontend changes. PR 2 is the only PR with frontend changes
and never deletes a route handler.

## Technical Feasibility

Feasible as a code-only change. The data layer is already shaped for
this:

- `PostService.findAndCount(dto)` returns `{ posts, totalPages, status }`
  in a `neverthrow` envelope. Callable from a server action or directly
  from an async Server Component without modification.
- `getPost` (`features/posts/actions/getPost.ts`) is the canonical
  server-action shape (`PostService.findOne(new FindPostDto(id))` →
  `result.match(...)`). The new read entry can mirror this if the
  action-wrapper option (Q1.b) is chosen.
- `deletePost` already calls `revalidatePath(ROUTES.posts)` /
  `revalidatePath(ROUTES.post(id))` and `redirect(ROUTES.posts)` — the
  mutation side of the cache contract is in place. The current gap is
  purely on the read side: the list lives in client state populated by
  `baseAPI`, so server-cache signals never reach it.
- `app/posts/[id]/page.tsx` + `features/posts/components/postPageContent`
  already use the exact pattern this project adopts: a synchronous
  page wrapping `<Suspense>` around an async Server Component that
  awaits `params` (a Promise) and calls a server action. The new
  `LatestPosts` rewrite follows the same shape, awaiting `searchParams`
  (also a Promise in Next.js 15+/16) inside the async child.
- Next.js 16.1.6 + React 19.2.4 give us async Server Components,
  `Promise`-shaped `searchParams`, and the modern caching primitives
  (`revalidateTag`, `unstable_cache` / `'use cache'` + `cacheTag`)
  needed for the invalidation story.

The remaining open question is **which** read entry shape and
invalidation primitive to land on (Q1 in `todos.md`). The async-
component shape itself is locked.

Required changes by PR:

**PR 1 (backend, additive).**

- Add a `getPaginatedPosts({ page, limit })` server action — or, if
  Q1 lands on service-direct, expose a thin server-only function
  callable from `LatestPosts`. Either way, returns the same
  `{ posts, totalPages, error }` shape.
- Adjust `FindAndCountPostsDto` (or add a sibling) so the read
  entry can pass `{ page, limit }` primitives without a `Request`.
  Note: the `Request`-based DTO becomes dead code once PR 3 ships
  and the GET handler goes — could be replaced outright rather
  than widened. Tracked in `todos.md`.
- Update `deletePost` to use the chosen invalidation primitive
  (`revalidatePath('/posts', 'page')` covers all `?page=N` per
  Next.js 16 docs; `revalidateTag('posts')` is cleaner if the read
  path opts into a tag). Pick one consistently across the read
  and mutation sides.
- Tests: new action / service-direct tests, mirroring
  `getPost.db.test.ts`. `deletePost` tests updated for the new
  invalidation call.

**PR 2 (frontend, cutover).**

- `app/posts/page.tsx` stays a synchronous Server Component. It
  renders the static header and the column wrapper, and contains
  `<Suspense fallback={...}>` around the new async `LatestPosts`.
  The page accepts `searchParams: Promise<{ page?: string }>` and
  passes the Promise through to `LatestPosts` without awaiting it
  (mirrors how `app/posts/[id]/page.tsx` passes `params: Promise<...>`
  to `PostPageContent`).
- `features/posts/components/latestPosts/latestPosts.tsx` becomes
  an `async function` Server Component (drops `'use client'`).
  Awaits `searchParams`, calls the new read entry from PR 1,
  renders `<PostCards>` + `<Pagination>`. The `useGetPaginatedPostsQuery`
  + `<Suspense>` wrapping inside the file goes away — Suspense
  lives in the page now.
- `PostCards` props change: `{ promise: PaginatedPostsQuery }` →
  `{ posts: AuthoredPost[] }`. The `use(promise)` consumption
  goes away.
- Delete `features/posts/hooks/useGetPaginatedPostsQuery.ts`,
  `features/posts/hooks/__tests__/useGetPaginatedPostsQuery.test.ts`,
  and `features/posts/types/paginatedPostsQuery.ts`.
- Add a pagination component (location TBD per Q2 — likely
  `globals/components/ui/pagination/` or `features/posts/components/
  pagination/`), driven by `?page=N` links via `next/link`. Library
  candidate: `react-headless-pagination`.
- Update `app/posts/__tests__/posts.page.test.tsx` to reflect the
  new shape (no hook to mock; either spy on the new read entry or
  use db-test integration — Q1 informs which).

**PR 3 (backend cleanup).**

- Delete `app/api/posts/route.ts` (the file's GET export only —
  the POST export needs to survive for `createPost`, still HTTP).
  If the file ends up POST-only, that's fine; if not, slim it
  to just POST.
- Delete `app/api/posts/__tests__/GET.db.test.ts`.
- Trim `mockGetPostsResponse` from `test/servers/postsServer` (or
  wherever it lives), preserving the POST handler scaffolding.

## Existing Patterns Reused

| Concern | Reference | Notes |
| --- | --- | --- |
| Sync page + async child in `<Suspense>` | `app/posts/[id]/page.tsx` + `features/posts/components/postPageContent/postPageContent.tsx` | The canonical pattern this project adopts. `PostsPage` mirrors `PostPage`; `LatestPosts` (rewritten) mirrors `PostPageContent`. |
| Server-action shape (`Service.findX(new XDto(...))` → `result.match`) | `features/posts/actions/getPost.ts` | Mirror for the new paginated-read action if Q1.b or Q1.c lands |
| Service error envelopes (`'dto'` / `'entity'`) | `features/posts/post.service.ts` (`findAndCount`) | Already returns the shape the new read entry needs; `findAndCount` itself has no auth branch (read is public) |
| Mutation invalidation (`revalidatePath` calls in actions) | `features/posts/actions/deletePost.ts` | May change to `revalidateTag('posts')` depending on Q1 — see `todos.md` |
| `searchParams` / `params` as `Promise` passed through Suspense | `app/posts/[id]/page.tsx` (`params: Promise<{ id: number }>`) → awaited inside `PostPageContent` | Apply the same shape to `searchParams` in `app/posts/page.tsx` → `LatestPosts` |
| Page test (server-rendered) | `app/posts/__tests__/posts.page.test.tsx` | Update in PR 2 to assert server-rendered list + pagination |
| Action db-test pattern | `features/posts/actions/__tests__/getPost.db.test.ts` | Mirror in PR 1 for the new read action if option Q1.b or Q1.c lands |

## Key Dependencies

- Next.js 16 caching primitives — `revalidatePath`, `revalidateTag`,
  and (TBD) `'use cache'` / `unstable_cache`. Internal / blocking /
  available; Q1 picks the combination.
- Existing `PostService.findAndCount` — internal / blocking /
  available; no changes anticipated below the DTO layer.
- Existing `deletePost` server action — internal / blocking /
  available; mutation side of the cache contract.
- Pagination library (likely `react-headless-pagination`) — external /
  non-blocking / needs evaluation. PR 2 only.
- No new packages anticipated for PR 1 or PR 3.

## Risks & Unknowns

- **R1 (medium): Cache-invalidation semantics across paginated
  variants.** `revalidatePath('/posts')` invalidates only the exact
  path; `revalidatePath('/posts', 'page')` invalidates all variants
  under that page (per Next.js 16 docs). `revalidateTag('posts')`
  fans out across every cached call that opted into the tag. The
  three combinations interact differently with `'use cache'` vs.
  `unstable_cache`. **Mitigation:** focused research pass during
  Step 2 + a small spike if the docs are ambiguous; record findings
  in `decisions.md`.

- **R2 (low): `FindAndCountPostsDto` shape.** Current DTO takes a
  `Request`. The new read entry needs primitives. **Mitigation:**
  widen DTO to also accept `{ page, limit }`, or introduce
  `FindAndCountPostsParamsDto` for the in-process path while
  leaving the `Request`-based DTO in place. Once PR 3 ships, the
  `Request` overload becomes dead code and can be removed (could
  be folded into PR 3, or done outright in PR 1 since PR 3 is a
  scheduled follow-up). Decide during Step 2.

- **R3 (low): msw scaffolding around `/api/posts` GET.** PR 3
  removes the GET handler, which makes the msw GET mock dead code.
  `POST /api/posts` stays in scope for `createPost` (out of scope
  here), so the msw setup itself stays. **Mitigation:** delete only
  the GET-specific helpers (`mockGetPostsResponse`) in PR 3;
  preserve the POST plumbing.

- **R4 (low): `'use cache'` directive maturity.** The directive is
  newer in the Next.js 16 line. If it's not GA-stable in 16.1.6,
  fall back to `unstable_cache` + `cacheTag` from `next/cache`
  (the same tag-based invalidation, just a more conservative API).
  **Mitigation:** pin the decision to whichever is non-experimental;
  Q1 captures this.

- **R5 (low): Pagination UI visual drift.** The codebase uses
  Tailwind + Shadcn primitives; a third-party pagination library
  may bring its own DOM/class assumptions. **Mitigation:** prefer
  headless libraries (`react-headless-pagination`) so the component
  only yields render slots; visual layer remains ours.

- **R6 (low): Transitional dead-handler window.** Between PR 2 and
  PR 3, `app/api/posts/route.ts`'s GET export is on `main` but no
  app code calls it. Direct callers (curls, external tooling) would
  still hit a working route during the gap. **Mitigation:** ship
  PR 3 promptly after PR 2; this is a portfolio site with no
  documented external API consumers — confirmed via the
  `useGetPaginatedPostsQuery`-only-caller check tracked in
  `todos.md`.

## Out of Scope

Explicit per `inputs/requirements.md` and the engineer's Step 1
scope confirmation:

- `createPost` migration off HTTP (`tryPostNewPost` →
  `PostService.create` direct). Tracked as a separate project.
- `POST /api/posts` deletion — coupled to the `createPost`
  migration; same separate project.
- Updating loading / error states. Engineer-confirmed: "current
  error handling and loading states are sufficient for this
  feature. Updating them is out of scope." The existing
  `<p>Loading posts...</p>` Suspense fallback survives the rewrite,
  just hoisted from inside `LatestPosts` to inside the page.
- Visual redesign of the posts page or post cards.
- Schema / data-model changes. The `Post` model is unchanged.
- Update functionality on posts (no update flow exists today;
  engineer flagged "out of scope for this project" in
  `requirements.md` § Personas & Permissions).
