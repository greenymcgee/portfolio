# PR 3 — Frontend Cutover

> Part of [server-side-paginated-posts architecture](../README.md).
> Source slice: [architecture.md](../../architecture.md) §6 "PR 3".

The user-visible cutover. When PR 3 lands, the `/posts` page switches
from `useGetPaginatedPostsQuery` + `baseAPI` to `getPaginatedPosts`
(async RSC + `'use cache'`), and `revalidateTag('posts')` in `deletePost`
starts doing real work.

PR 3 is the revert target if a regression appears after the cutover.

## Files changed in PR 3

| File | Change |
| --- | --- |
| `app/posts/page.tsx` | Changed — gains `searchParams` prop; Suspense fallback hoists |
| `app/posts/__tests__/posts.page.test.tsx` | Rewritten — spy on `PostService.findAndCount`; no msw |
| `features/posts/components/latestPosts/latestPosts.tsx` | Changed — drops `'use client'`; becomes async RSC |
| `features/posts/components/latestPosts/__tests__/latestPosts.test.tsx` | Rewritten — spy on `PostService.findAndCount`; no msw |
| `features/posts/components/postCards/postCards.tsx` | Changed — props `{ promise }` → `{ posts }`; `use()` removed |
| `features/posts/components/pagination/pagination.tsx` | New — feature wrapper |
| `features/posts/components/pagination/index.ts` | New |
| `features/posts/components/pagination/__tests__/pagination.test.tsx` | New — wrapper behavior + truncation |
| `features/posts/components/pagination/getTruncatedPageList.ts` | Conditional — if truncation logic extracted |
| `features/posts/components/pagination/__tests__/getTruncatedPageList.test.ts` | Conditional — if extracted |
| `features/posts/hooks/useGetPaginatedPostsQuery.ts` | Deleted |
| `features/posts/hooks/__tests__/useGetPaginatedPostsQuery.test.ts` | Deleted |
| `features/posts/types/paginatedPostsQuery.ts` | Deleted |

## Nothing in PR 3 touches

- `app/api/posts/route.ts` (GET handler survives until PR 4)
- `features/posts/post.{service,repository}.ts`
- `features/posts/dto/`
- `globals/components/ui/` (primitives already landed in PR 1)

## Component hierarchy after PR 3

```
PostsPage (sync RSC)
├─ AdminMenuContentSetter (PostsPageAdminMenuContent)
└─ <main>
   ├─ <header> (static — streams immediately)
   └─ <article>
      └─ <Suspense fallback={<p>Loading posts...</p>}>
         └─ LatestPosts (async RSC)
            ├─ getPaginatedPosts({ page, limit: 10 })
            ├─ PostCards (RSC, props: { posts })     ← posts.length > 0
            │   OR <p data-testid="latest-posts-empty">  ← posts.length === 0
            └─ <Pagination currentPage totalPages /> ← totalPages > 1 only
```

## Sub-docs

| Concern | Doc |
| --- | --- |
| `PostsPage` | [`./page.md`](./page.md) |
| `LatestPosts` | [`./latest-posts.md`](./latest-posts.md) |
| `PostCards` | [`./post-cards.md`](./post-cards.md) |
| Pagination wrapper | [`./pagination-wrapper.md`](./pagination-wrapper.md) |
| Test plan | [`../testing-strategy.md`](../testing-strategy.md) → "PR 3 tests" |
