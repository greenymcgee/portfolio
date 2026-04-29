# Pagination Wrapper — Feature-Level Component

> Part of [PR 3 frontend cutover](./README.md) →
> [server-side-paginated-posts architecture](../README.md). Source
> slice: [architecture.md](../../architecture.md) §6.6 "PR 3 —
> Feature-level wrapper".

File: `features/posts/components/pagination/pagination.tsx` (new).

## Public API

```tsx
<Pagination currentPage={number} totalPages={number} />
```

`currentPage` is zero-indexed (page 0 = page 1 in the URL). `totalPages`
is the count returned by `PostService.findAndCount`. `LatestPosts` renders
this component only when `totalPages > 1`.

## Responsibilities

1. Accept `{ currentPage, totalPages }`.
2. Compute the visible page list (truncation rule below).
3. Render the primitive composition:
   ```tsx
   <Pagination aria-label="Posts pagination">
     <PaginationContent>
       <PaginationItem><PaginationPrevious href="…" /></PaginationItem>
       …page links…
       <PaginationItem><PaginationNext href="…" /></PaginationItem>
     </PaginationContent>
   </Pagination>
   ```
4. Disable `<PaginationPrevious>` at `currentPage === 0` and
   `<PaginationNext>` at `currentPage === totalPages - 1` via
   `aria-disabled="true"` + `pointer-events-none`.

## Imports

```typescript
import {
  Pagination as PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/globals/components/ui'
```

All 7 primitives are already in `globals/components/ui/index.ts` after
PR 1. No deep imports.

**Name collision:** This file exports `Pagination` (the feature wrapper)
and simultaneously imports `Pagination` (the primitive) from `@/globals/components/ui`.
Alias the primitive import as `PaginationNav` (or any non-colliding name)
and use `<PaginationNav ...>` as the JSX tag inside this file. The public
export name stays `Pagination` so `LatestPosts`'s import path
(`import { Pagination } from '../pagination'`) is unchanged.

## Page-list truncation rule

`<Pagination>` only renders when `totalPages > 1`, so the truncation
logic only needs to handle `totalPages >= 2`.

| `currentPage` | `totalPages` | Rendered page list |
| --- | --- | --- |
| any | `≤ 7` | All pages: `[1, 2, …, totalPages]` |
| 0 | 10 | `[1, 2, 3, …, 10]` |
| 4 | 10 | `[1, …, 4, 5, 6, …, 10]` |
| 9 | 10 | `[1, …, 8, 9, 10]` |

Window rule when `totalPages > 7`: show first page, ellipsis if
non-adjacent, pages `currentPage-1` through `currentPage+1` (clamped to
valid range), ellipsis if non-adjacent, last page.

## Href convention

Page links use `href={`${ROUTES.posts}?page=${pageNumber - 1}`}` — the
URL `?page` parameter is zero-indexed, but the display label is
one-indexed. Page 1 → `?page=0`, Page 2 → `?page=1`, etc.

`ROUTES.posts` is the base `/posts` path. Import from
`@/globals/constants`.

## Boundary disable behavior

```tsx
<PaginationPrevious
  aria-disabled={currentPage === 0 ? 'true' : undefined}
  className={clsx(currentPage === 0 && 'pointer-events-none')}
  href={`${ROUTES.posts}?page=${currentPage - 1}`}
/>
```

`aria-disabled="true"` signals the disabled state to assistive
technology. `pointer-events-none` prevents clicks without changing the
visual rhythm (the link still renders). This matches Shadcn's own
recommended pattern for pagination boundary states.

## Accessibility

- `<Pagination aria-label="Posts pagination">` — overrides the
  primitive's default `"pagination"` label with a context-specific one.
- Keyboard tab order: Previous → page links → Next.
- Active page: `<PaginationLink isActive={true}>` sets `aria-current="page"`.
- Ellipsis: `<PaginationEllipsis>` is `aria-hidden="true"` with SR-only
  "More pages" text — contributed by the primitive, not the wrapper.

## Truncation logic placement — implementation-time call

Default: keep the page-list computation inline in `pagination.tsx`. If
during PR 3 authorship it grows beyond a few clear branches (boundary
conditions, ellipsis-collapse logic, off-by-ones for window clamp), the
implementer extracts it to:

```
features/posts/components/pagination/getTruncatedPageList.ts
features/posts/components/pagination/__tests__/getTruncatedPageList.test.ts
```

Pure-function tests against the truncation table above move to
`getTruncatedPageList.test.ts`; the wrapper test keeps ARIA and
boundary assertions only.

The judgment is the implementer's at write-time. See
[`../../decisions.md`](../../decisions.md) → "Truncation logic
placement: implementation-time call".

## Barrel export

`features/posts/components/pagination/index.ts`:

```typescript
export * from './pagination'
```

`LatestPosts` imports `<Pagination>` from `'../pagination'` (relative,
feature-local — not from `@/globals/components/ui`). The globals UI
exports the *primitives*; the feature-level wrapper is feature-specific.

## Test file

`features/posts/components/pagination/__tests__/pagination.test.tsx`.
See [`../testing-strategy.md`](../testing-strategy.md) → "PR 3 tests →
`pagination.test.tsx`" for the full assertion table.
