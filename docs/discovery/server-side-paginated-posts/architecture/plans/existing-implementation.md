# Existing Implementation — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §2.

## Current read path

1. `app/posts/page.tsx` is a synchronous Server Component. It wraps
   `<LatestPosts>` in `<Suspense>` **with no fallback**; the fallback
   lives one layer deeper inside `LatestPosts`.

2. `features/posts/components/latestPosts/latestPosts.tsx` is `'use
   client'`. It calls `useGetPaginatedPostsQuery()` (returning a
   `Promise`) and renders:
   ```tsx
   <div aria-live="polite" data-testid="latest-posts">
     <Suspense fallback={<p>Loading posts...</p>}>
       <PostCards promise={promise} />
     </Suspense>
   </div>
   ```

3. `features/posts/hooks/useGetPaginatedPostsQuery.ts` reads `page`
   from `useSearchParams`, calls
   `baseAPI.get<FindAndCountPostsResponse>(`${API_ROUTES.posts}?page=${page}`)`,
   and returns a `PaginatedPostsQuery` (`Promise<{ data, error }>`).

4. `features/posts/components/postCards/postCards.tsx` consumes the
   promise via `use(promise)`, checks `error`, and maps `data.posts`
   to `<Card>` rows.

5. `app/api/posts/route.ts` `GET` handler instantiates
   `new FindAndCountPostsDto(request)`, calls
   `PostService.findAndCount(dto)`, returns the `neverthrow` result via
   `createResponse`.

6. `features/posts/dto/find-and-count-posts.dto.ts` parses `?page` and
   `?limit` from `request.url` via `findAndCountPostsSchema`.

7. `features/posts/actions/deletePost.ts` success branch:
   ```ts
   revalidatePath(ROUTES.post(state.id))
   revalidatePath(ROUTES.posts)
   redirect(ROUTES.posts)
   ```

## The bug

`revalidatePath(ROUTES.posts)` invalidates the server-side render cache
for `/posts`, but does nothing to the `baseAPI`-fetched client state
inside `useGetPaginatedPostsQuery`. After a delete, the user sees stale
posts until a hard navigation. The cache and the client sit on different
invalidation planes.

## Current data flow

```
Browser
  → useSearchParams (page=N)
  → useGetPaginatedPostsQuery
  → baseAPI.get /api/posts?page=N
  → app/api/posts/route.ts GET
  → new FindAndCountPostsDto(request)
  → PostService.findAndCount(dto)
  → prisma.post.findMany / count
```

Mutation path:
```
deletePost
  → PostService.delete
  → revalidatePath(ROUTES.post(id))   ← server render cache only
  → revalidatePath(ROUTES.posts)      ← server render cache only
  → redirect(ROUTES.posts)
      ↳ baseAPI-cached client state NOT invalidated ← the bug
```

## No pagination UI

There is no pagination control on the page today. `?page=N` is
accessible only via direct URL manipulation. `PostsPage` renders
`<LatestPosts>` without any page indicator or navigation control.

## Files touched by this project

| File | Status | PR |
| --- | --- | --- |
| `globals/components/ui/pagination/` (7 new directories) | New | PR 1 |
| `globals/components/ui/index.ts` | Changed (7 export lines added) | PR 1 |
| `features/posts/actions/getPaginatedPosts.ts` | New | PR 2 |
| `features/posts/dto/find-and-count-posts.dto.ts` | Changed (primitives constructor) | PR 2 |
| `features/posts/actions/deletePost.ts` | Changed (`revalidatePath` → `revalidateTag`) | PR 2 |
| `app/api/posts/route.ts` | Changed (GET reads searchParams + passes primitives) | PR 2 |
| `app/posts/page.tsx` | Changed (gains `searchParams` prop + Suspense fallback) | PR 3 |
| `features/posts/components/latestPosts/latestPosts.tsx` | Changed (async RSC, drops `'use client'`) | PR 3 |
| `features/posts/components/postCards/postCards.tsx` | Changed (props: `{ promise }` → `{ posts }`) | PR 3 |
| `features/posts/components/pagination/` | New (feature wrapper) | PR 3 |
| `features/posts/hooks/useGetPaginatedPostsQuery.ts` | Deleted | PR 3 |
| `features/posts/types/paginatedPostsQuery.ts` | Deleted | PR 3 |
| `app/api/posts/route.ts` | Changed (GET export deleted) | PR 4 |
| `app/api/posts/__tests__/GET.db.test.ts` | Deleted | PR 4 |
| `test/servers/postsServer.ts` | Changed (GET handler + `mockGetPostsResponse` removed) | PR 4 |
