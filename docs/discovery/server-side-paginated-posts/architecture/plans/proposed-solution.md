# Proposed Solution — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §3–§6.

Replace the client-side `useGetPaginatedPostsQuery` read flow with a
server-rendered list delivered through an async Server Component inside
`<Suspense>` on a synchronous page. Add a Shadcn pagination UI. Delete
the `GET /api/posts` route handler once nothing in the app calls it.
Ships as 4 sequential PRs.

## File tree — all PRs

### PR 1 — Pagination primitives (additive)

```
globals/components/ui/
├── pagination/
│   ├── pagination.tsx                              (new)
│   ├── index.ts                                    (new)
│   └── __tests__/
│       └── pagination.test.tsx                     (new)
├── paginationContent/
│   ├── paginationContent.tsx                       (new)
│   ├── index.ts                                    (new)
│   └── __tests__/
│       └── paginationContent.test.tsx              (new)
├── paginationItem/
│   ├── paginationItem.tsx                          (new)
│   ├── index.ts                                    (new)
│   └── __tests__/
│       └── paginationItem.test.tsx                 (new)
├── paginationLink/
│   ├── paginationLink.tsx                          (new)
│   ├── index.ts                                    (new)
│   └── __tests__/
│       └── paginationLink.test.tsx                 (new)
├── paginationPrevious/
│   ├── paginationPrevious.tsx                      (new)
│   ├── index.ts                                    (new)
│   └── __tests__/
│       └── paginationPrevious.test.tsx             (new)
├── paginationNext/
│   ├── paginationNext.tsx                          (new)
│   ├── index.ts                                    (new)
│   └── __tests__/
│       └── paginationNext.test.tsx                 (new)
├── paginationEllipsis/
│   ├── paginationEllipsis.tsx                      (new)
│   ├── index.ts                                    (new)
│   └── __tests__/
│       └── paginationEllipsis.test.tsx             (new)
└── index.ts                                        (changed — 7 new export lines)
```

PR 1 is purely additive. All seven components are dead code until PR 3
imports them — the same posture as any Shadcn primitive landed ahead of
its first consumer.

### PR 2 — Backend additive

```
features/posts/
├── actions/
│   ├── getPaginatedPosts.ts                        (new)
│   └── __tests__/
│       └── getPaginatedPosts.db.test.ts            (new)
├── dto/
│   ├── find-and-count-posts.dto.ts                (changed — primitives constructor)
│   └── __tests__/
│       └── find-and-count-posts.dto.test.ts       (changed — drop Request-based cases)
└── actions/
    ├── deletePost.ts                               (changed — revalidatePath → revalidateTag)
    └── __tests__/
        └── deletePost.db.test.ts                  (changed — assert revalidateTag instead)

app/api/posts/route.ts                              (changed — GET reads searchParams + passes primitives)
app/api/posts/__tests__/GET.db.test.ts             (changed — update for primitives DTO shape)
```

PR 2 is additive on the new code path. The old `GET /api/posts` route
handler still works — `useGetPaginatedPostsQuery` (still alive in PR 2)
continues to call it. The frontend is entirely unaffected.

`revalidateTag('posts')` in `deletePost` is a no-op in PR 2's state:
no `'use cache'`-tagged entries exist until PR 3 lands `LatestPosts` as
an async RSC. This is forward-compatible — the tag call is safe to ship
before any consumers exist.

### PR 3 — Frontend cutover

```
app/posts/page.tsx                                  (changed — searchParams prop + Suspense fallback)
app/posts/__tests__/posts.page.test.tsx            (rewritten — PostService.findAndCount spy)

features/posts/components/
├── latestPosts/
│   ├── latestPosts.tsx                            (changed — async RSC, drops 'use client')
│   └── __tests__/
│       └── latestPosts.test.tsx                   (rewritten — PostService.findAndCount spy)
├── postCards/
│   └── postCards.tsx                              (changed — props: { promise } → { posts })
└── pagination/
    ├── pagination.tsx                             (new — feature wrapper)
    ├── index.ts                                   (new)
    └── __tests__/
        └── pagination.test.tsx                    (new — wrapper behavior)
        ── getTruncatedPageList.ts                 (conditional — if truncation logic extracted)
        ── __tests__/
           └── getTruncatedPageList.test.ts        (conditional — if extracted)

features/posts/hooks/
├── useGetPaginatedPostsQuery.ts                   (deleted)
└── __tests__/
    └── useGetPaginatedPostsQuery.test.ts          (deleted)

features/posts/types/
└── paginatedPostsQuery.ts                         (deleted)
```

PR 3 is the user-visible cutover. When this lands, the page reads from
`'use cache'` and `revalidateTag('posts')` in `deletePost` starts doing
real work. Revert target if a regression appears.

### PR 4 — Backend cleanup

```
app/api/posts/route.ts                             (changed — GET export deleted; file becomes POST-only)
app/api/posts/__tests__/GET.db.test.ts            (deleted)
test/servers/postsServer.ts                        (changed — GET handler + mockGetPostsResponse removed)
test/servers/index.ts                              (changed — update exports if mockGetPostsResponse was re-exported)
```

PR 4 is pure deletion. No frontend is touched. Ship promptly after PR 3
soaks through at least one delete-flow exercise.

## Single-concern shape

Each PR has exactly one reviewable concern:

| PR | Reviewer concern |
| --- | --- |
| 1 | Are the primitives correct, accessible, consistent with `globals/components/ui/`? |
| 2 | Is the cached read entry correct? Is the invalidation primitive right? |
| 3 | Is the cutover safe? Does the user-facing page behave correctly? |
| 4 | Is the deletion clean? Does the `POST` handler survive? |

## Where to drill in next

| If you need … | Read |
| --- | --- |
| PR 1 implementation detail | [`./pr1-pagination-primitives/README.md`](./pr1-pagination-primitives/README.md) |
| PR 2 — cached read entry | [`./pr2-backend-additive/action.md`](./pr2-backend-additive/action.md) |
| PR 2 — DTO change | [`./pr2-backend-additive/dto.md`](./pr2-backend-additive/dto.md) |
| PR 2 — `deletePost` mutation | [`./pr2-backend-additive/mutation.md`](./pr2-backend-additive/mutation.md) |
| PR 3 — page + LatestPosts + PostCards | [`./pr3-frontend-cutover/README.md`](./pr3-frontend-cutover/README.md) |
| PR 3 — pagination wrapper | [`./pr3-frontend-cutover/pagination-wrapper.md`](./pr3-frontend-cutover/pagination-wrapper.md) |
| PR 4 deletion scope | [`./pr4-backend-cleanup.md`](./pr4-backend-cleanup.md) |
| Why decisions were made | [`../decisions.md`](../decisions.md) |
