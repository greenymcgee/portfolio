# User-Facing Behavior — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §4.

## Personas

| Persona | Role | Key actions | Auth |
| --- | --- | --- | --- |
| Visitor | Anonymous reader | View posts list, paginate, view individual post | None — read is public |
| Admin | Authenticated admin | All Visitor actions + delete posts | NextAuth.js v4 session, `posts.delete` permission |

## User Flows

### Flow 1: Viewing Posts (Visitor or Admin)

1. User navigates to `/posts` (or `/posts?page=N`).
2. `PostsPage` (sync RSC) streams the static `'Round the Corner` header
   + `<Suspense fallback={<p>Loading posts...</p>}>` shell to the browser.
3. `LatestPosts` (async RSC) resolves inside the Suspense boundary:
   awaits `searchParams`, normalizes `page`, calls
   `getPaginatedPosts({ page, limit: 10 })`. On cache hit the result
   returns immediately; on miss it hits Prisma, caches the result tagged
   `'posts'`.
4. `LatestPosts` renders `<PostCards posts={posts} />` and (if
   `totalPages > 1`) `<Pagination currentPage={page} totalPages={totalPages} />`.
5. User clicks a pagination link. `<Pagination>` renders
   `<Link href="/posts?page=N">` items — the click is a soft navigation,
   `?page` updates, the page re-renders with the new `searchParams`
   Promise, and the cached entry for that page (if any) returns immediately.
6. User clicks a post card → navigates to `/posts/[id]`.

### Flow 2: Creating a Post (Admin) — out of scope

The create flow remains on `tryPostNewPost` + `POST /api/posts` and is
migrated by a separate project. See
[`../decisions.md`](../decisions.md) → "Scope: read path only".

### Flow 3: Deleting a Post (Admin)

1. Admin opens `AdminMenuDialog` from the posts page.
2. Admin clicks "Delete" on a post.
3. `deletePost` server action:
   `PostService.delete(...)` → `revalidateTag('posts')` → `redirect(ROUTES.posts)`.
4. Browser lands on `/posts` (no `?page`). `revalidateTag('posts')`
   invalidated every cached `getPaginatedPosts` entry; the next render
   fetches fresh data for page 0.
5. Admin sees the post is gone.

### Flow 4: Deleting a Post from Page 2 (Admin)

Same as Flow 3, except after the redirect the admin manually navigates
to page 2. Because `revalidateTag('posts')` invalidated *all*
page-keyed cache entries, page 2 also returns fresh data on first
render.

Note: `redirect(ROUTES.posts)` strips query params and lands the user
on page 1. The spec requires a manual re-navigate to page 2, not an
automatic return to the previous page. This is intentional per the
engineer's `inputs/requirements.md`.

## Scope Boundaries

**In scope:**
- Pagination primitives: Shadcn `<Pagination>` install at
  `globals/components/ui/`, one component per directory, with per-component
  tests. Reuses existing `BUTTON_VARIANTS`.
- Read flow migration: `useGetPaginatedPostsQuery` → cached
  `getPaginatedPosts` server function called from an async Server
  Component.
- DTO shape change: `FindAndCountPostsDto` accepts `{ page, limit }`
  primitives.
- Mutation invalidation: `deletePost` swaps `revalidatePath` for
  `revalidateTag('posts')`.
- Feature-level pagination wrapper at `features/posts/components/pagination/`.
- Deletion of `GET /api/posts` handler, its test, and the
  `mockGetPostsResponse` msw helper. Preserves `POST` for `createPost`.
- Test updates: new action db-test, rewritten `latestPosts.test.tsx` and
  `posts.page.test.tsx`, deleted `useGetPaginatedPostsQuery.test.ts`.

**Out of scope:**
- `createPost` migration off `tryPostNewPost` / HTTP. Separate project.
- `POST /api/posts` deletion. Coupled to `createPost` migration.
- Loading and error UX rework. Engineer-confirmed: existing
  `<p>Loading posts...</p>` Suspense fallback is sufficient; it hoists
  from inside `LatestPosts` to inside `PostsPage`.
- Visual redesign of the posts page or post cards.
- Schema / data-model changes.
- i18n. No `next-intl` / `i18next` infrastructure exists; strings ship
  hardcoded as everywhere else.

## Edge Cases & Error States

| Scenario | Expected behavior |
| --- | --- |
| Invalid `?page` (`"abc"`, negative, very large) | `findAndCountPostsSchema` coerces; non-numeric → Zod error → `LatestPosts` renders `<p data-testid="latest-posts-error">Something went wrong</p>`. Schema `transform((page) => page \|\| 0)` already collapses `0` / falsy / NaN to page 0 for in-range invalid inputs. |
| `?page` greater than `totalPages` | `prisma.post.findMany` returns `[]`; `LatestPosts` renders `<p data-testid="latest-posts-empty">No posts on this page</p>`. `<Pagination>` still renders (if `totalPages > 1`) so the user can navigate back. Accepted for MVP. |
| Prisma error during read | `PostService.findAndCount` returns an `entity` error envelope → `getPaginatedPosts` returns `{ error, posts: [], totalPages: 0 }` → `LatestPosts` renders `<p data-testid="latest-posts-error">Something went wrong</p>`. |
| Cache miss under load | First request per `{ page, limit }` combo hits Prisma; subsequent requests within `cacheLife` window read from in-memory LRU. No user-visible difference beyond first-request latency. |
| Stale cache between revalidations | Default: stale at 5min (client), revalidate at 15min (server). Acceptable for a portfolio site. |
| Concurrent deletes from two admin sessions | Both calls run `revalidateTag('posts')`. Tag invalidation is idempotent — the second call is a no-op. No race risk. |
| Mutation followed by immediate read | `revalidateTag` invalidates synchronously within the request lifecycle; the redirect's next render fetches fresh data. |
| `totalPages === 0` (no posts) | `<Pagination>` does not render (`totalPages > 1` guard). `LatestPosts` renders the empty-state message. |
| `totalPages === 1` (all posts fit on one page) | `<Pagination>` does not render. Posts render normally. |
