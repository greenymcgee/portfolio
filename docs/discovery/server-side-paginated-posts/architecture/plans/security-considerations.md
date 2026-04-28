# Security Considerations — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §3.2.

## Read path — public, no auth-scoped data in cache

`PostService.findAndCount` has no auth branch. Post listings are public
regardless of viewer role. No change here.

`getPaginatedPosts` is keyed by `{ page, limit }` — no session cookie,
no user ID, no role flows through the cache key. There is zero risk of
leaking admin-visible state to anonymous viewers via the `'use cache'`
layer. If future work adds auth-scoped fields to the listing (e.g.,
showing unpublished posts to admins), the cache key must include a
session identifier or a separate uncached path must be used.

## Write path — admin-gated, unchanged

`deletePost` remains admin-gated via `PostService.delete` →
`authenticateAPISession` → `authorizeUser('delete')`. No changes to
the authorization chain.

The `revalidateTag('posts')` call in `deletePost` is side-effect-only
(invalidates cache) and requires no auth itself. Tag invalidation is
server-side and not callable by browser clients directly.

## `GET /api/posts` window (PR 2 → PR 4)

Between PR 2 landing and PR 4 shipping, `GET /api/posts` is on `main`
with no in-app callers. Direct callers (curl, external tooling) still
hit a working, public endpoint returning paginated posts. This is
equivalent to the current posture — the route is already public — so
no new attack surface is introduced.

PR 4 deletes only the `GET` export; the `POST` export (`createPost`)
survives unaffected.

## No new attack surfaces

| Concern | Status |
| --- | --- |
| CSRF on `deletePost` | Unchanged — Next.js server action CSRF protections apply |
| XSS via paginated post data | Unchanged — React escapes all rendered values |
| Path traversal via `?page` | Mitigated by Zod `coerce.number()` in `findAndCountPostsSchema` |
| Cache poisoning | Not applicable — `'use cache'` is server-side in-memory LRU; no external cache layer |
| Auth-scoped cache leakage | Not applicable — post listings are public; cache key contains no user identity |
