# Risks & Open Questions — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §7.

All risks were evaluated during Step 2 research against Next.js 16.1.6
docs. All landed at **low** after research.

## R1 (low — was medium): Cache-invalidation semantics

**Risk:** `revalidateTag('posts')` might not invalidate every `{ page,
limit }` cache entry cleanly.

**Resolution:** Confirmed by Next.js 16 docs. `revalidateTag('posts')`
invalidates every `'use cache'` entry tagged `'posts'`, regardless of
the `{ page, limit }` key arguments. `cacheComponents: true` is already
set in `next.config.ts:6`. No flag flip needed.

## R2 (resolved): `FindAndCountPostsDto` shape

**Risk:** The `Request`-based constructor conflicts with the new
in-process call site.

**Resolution:** Replace outright in PR 2. Zod schema (`coerce.number()`)
accepts both string and number inputs — the schema itself needs no
change. PR 4 deletes the GET handler, at which point the old call site
is gone. See [`../decisions.md`](../decisions.md) → "DTO shape: replace
outright in PR 1 (option c)".

## R3 (low): msw scaffolding around `GET /api/posts`

**Risk:** PR 4's GET handler deletion leaves msw scaffolding (`postsServer`
handlers + `mockGetPostsResponse`) in place, confusing future test
authors.

**Mitigation:** PR 4 removes both the GET msw handler and the
`mockGetPostsResponse` export from `test/servers/postsServer.ts`.
The `POST /api/posts` handler and `mockPostsCreateResponse` helper are
unaffected. `postsServer` itself (the `setupServer` wrapper) survives.

## R4 (resolved): `'use cache'` maturity

**Risk:** `'use cache'` might be experimental / unstable in 16.1.6.

**Resolution:** GA in Next.js 16.0.0+. `cacheComponents: true` is
already enabled in `next.config.ts:6`. No action needed.

## R5 (low): Pagination UI visual drift

**Risk:** Shadcn primitives diverge visually from the existing `Button`
design over time.

**Mitigation:** `<PaginationLink>` reuses `BUTTON_VARIANTS` directly
(same `cva` call the `Button` component uses) — the style surface is
shared, not duplicated. Drift risk is the same as adopting any other
Shadcn primitive.

## R6 (low): Transitional dead-handler window

**Risk:** Between PR 3 and PR 4, `GET /api/posts` is on `main` with no
in-app callers. External tools (curl, third-party clients) could still
hit it.

**Mitigation:** The route was already public. No new attack surface is
added. Only `useGetPaginatedPostsQuery` called it (confirmed via
`baseAPI.get` grep — `postPostCreateRequest.ts` is the `POST` caller,
unaffected). Ship PR 4 promptly after PR 3 soaks.

## R7 (low): `getPaginatedPosts` not callable from Client Components

**Risk:** A future Client Component wants paginated posts but cannot
call `getPaginatedPosts` (which lacks `'use server'` and thus cannot be
invoked from the client).

**Mitigation:** Today only `LatestPosts` calls it, and `LatestPosts` is
an RSC. Document at the `getPaginatedPosts` call site so it's
discoverable. If a client-side caller surfaces later, the fix is a
`'use server'` wrapper (re-introducing a marshalling boundary) or a
separate uncached read path.

## R8 (low): Cache key collision via default `limit`

**Risk:** If a second caller passes a different `limit`, the cache key
splits into separate entries (`{ page: 0, limit: 10 }` vs.
`{ page: 0, limit: 5 }`), increasing memory pressure.

**Mitigation:** Tag invalidation still fans out across all entries
tagged `'posts'`, so correctness is unaffected. Today only `LatestPosts`
calls `getPaginatedPosts`, always with `limit: 10`. Flag if a second
surface emerges with a different limit.

## Open items (implementation-time)

These are not engineer-call blockers — all are resolved during PR
authorship. See [`../todos.md`](../todos.md) for full text.

| Item | PR | Disposition |
| --- | --- | --- |
| Primitives a11y assertions (per-component tests) | PR 1 | Author during PR 1 |
| `BUTTON_VARIANTS` reuse sanity check | PR 1 | Verify during PR 1; adjust if visual drift |
| `revalidatePath` removal grep | PR 2 | Run grep before PR 2 ships |
| `getPaginatedPosts` arg shape (destructured vs. positional) | PR 2 | Confirm at call site during PR 2 |
| `'use cache'` deduplication — JSDoc | PR 2 | Low-priority; document at call site |
| Wrapper a11y assertions | PR 3 | Author during PR 3 |
| Page-list truncation spec (drives inline vs. extract call) | PR 3 | Implement-time judgment |
| Cache lifetime revisit | Post-launch | Monitor post-PR 3 soak; tighten if needed |
