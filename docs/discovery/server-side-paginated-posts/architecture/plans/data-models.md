# Data Models — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §3.1.

## No schema changes

The `Post` model is unchanged. No migrations. No backfill. The data
shape going into and out of `PostService.findAndCount` is the same as
today — only the call site and cache layer change.

## `FindAndCountPostsDto` — constructor shape change

The DTO (`features/posts/dto/find-and-count-posts.dto.ts`) changes its
constructor from `Request`-based to primitives-based in PR 2. This is a
call-site change, not a data-model change.

| | Before (PR 1 state) | After (PR 2+) |
| --- | --- | --- |
| Constructor | `constructor(request: Request)` | `constructor({ page, limit }: { page: number; limit?: number })` |
| Internal Zod schema | `findAndCountPostsSchema` — unchanged | unchanged |
| Output of `.params` | `{ limit, offset }` or `ZodError` | unchanged |

The Zod schema uses `coerce.number()`, which accepts both string and
number inputs, so the schema needs no adjustment for the new shape.

## `PostService.findAndCount` — unchanged

Signature: `findAndCount(dto: FindAndCountPostsDto)`.
Returns `{ posts, status, totalPages }` in a `neverthrow` envelope.
No changes in this project.

## Types deleted in PR 3

| Type | File | Reason |
| --- | --- | --- |
| `PaginatedPostsQuery` | `features/posts/types/paginatedPostsQuery.ts` | `PostCards` no longer receives a Promise — the type has no callers after the cutover |
| `FindAndCountPostsResponse` (import in hook) | Used only by `useGetPaginatedPostsQuery` | Hook deleted; import disappears with it |
