# `FindAndCountPostsDto` — Primitives Constructor

> Part of [PR 2 backend additive](./README.md) →
> [server-side-paginated-posts architecture](../README.md). Source
> slice: [architecture.md](../../architecture.md) §6.5 "DTO change".

File: `features/posts/dto/find-and-count-posts.dto.ts` (changed).

## Before (current state)

```typescript
constructor(request: Request) {
  this.url = new URL(request.url)
}

private get searchParams() {
  const { searchParams } = this.url
  return { limit: searchParams.get('limit'), page: searchParams.get('page') }
}
```

The DTO reads `?page` and `?limit` off a `Request` URL and parses them
via `findAndCountPostsSchema` (Zod, with `coerce.number()`).

## After (PR 2)

```typescript
constructor({ limit, page }: { limit?: number; page: number }) {
  this.limit = limit ?? 10
  this.page = page
}
```

The private `url` field and the `searchParams` getter are removed. The
`validateParams()` method and the `params` getter (`{ limit, offset }`)
are unchanged. `findAndCountPostsSchema` is unchanged — `coerce.number()`
accepts both string and number inputs, so the schema validates the
primitives directly.

## Why replace outright (not widen)

The `Request`-based constructor's only caller is the `GET /api/posts`
handler in `app/api/posts/route.ts`. PR 4 deletes that handler, so the
`Request`-based shape is dead code from the moment PR 3 lands. Carrying
a dual-mode constructor (`Request` + primitives) across the PR sequence
adds runtime branching (`if (input instanceof Request)`) for code that
disappears three PRs later.

See [`../../decisions.md`](../../decisions.md) → "DTO shape: replace
outright in PR 1 (option c)" (numbering refers to the 3-PR plan; under
the 4-PR plan this lands in PR 2).

## GET handler update (PR 2)

`app/api/posts/route.ts`'s `GET` handler changes to:

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '0')
  const limit = Number(searchParams.get('limit') ?? '10')
  const result = await PostService.findAndCount(
    new FindAndCountPostsDto({ page, limit }),
  )
  return createResponse(result)
}
```

The handler now owns the `searchParams` extraction (the responsibility
the DTO used to carry). The DTO receives clean numbers.

This handler is updated in PR 2 and deleted in PR 4. `POST` is unaffected.

## Test impact

`find-and-count-posts.dto.test.ts`: drop all `Request`-based test
cases; add primitives-constructor cases. See
[`../testing-strategy.md`](../testing-strategy.md) → "PR 2 tests →
`find-and-count-posts.dto.test.ts`".
