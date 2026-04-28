# PR 1 — Pagination Primitives

> Part of [server-side-paginated-posts architecture](../README.md).
> Source slice: [architecture.md](../../architecture.md) §6.4 "PR 1".

Shadcn's `<Pagination>` reference primitive, copy-pasted and split
one-component-per-directory to match the `globals/components/ui/`
convention (`button/`, `heading/`, `spinner/`, `toaster/` all follow
this shape). No new `package.json` dependency.

PR 1 is **purely additive** — all seven components are dead code until
PR 3 imports them from `features/posts/components/pagination/`.

## File tree

```
globals/components/ui/
├── pagination/
│   ├── pagination.tsx         (new)
│   ├── index.ts               (new)
│   └── __tests__/
│       └── pagination.test.tsx (new)
├── paginationContent/
│   ├── paginationContent.tsx  (new)
│   ├── index.ts               (new)
│   └── __tests__/
│       └── paginationContent.test.tsx (new)
├── paginationItem/
│   ├── paginationItem.tsx     (new)
│   ├── index.ts               (new)
│   └── __tests__/
│       └── paginationItem.test.tsx (new)
├── paginationLink/
│   ├── paginationLink.tsx     (new)
│   ├── index.ts               (new)
│   └── __tests__/
│       └── paginationLink.test.tsx (new)
├── paginationPrevious/
│   ├── paginationPrevious.tsx (new)
│   ├── index.ts               (new)
│   └── __tests__/
│       └── paginationPrevious.test.tsx (new)
├── paginationNext/
│   ├── paginationNext.tsx     (new)
│   ├── index.ts               (new)
│   └── __tests__/
│       └── paginationNext.test.tsx (new)
├── paginationEllipsis/
│   ├── paginationEllipsis.tsx (new)
│   ├── index.ts               (new)
│   └── __tests__/
│       └── paginationEllipsis.test.tsx (new)
└── index.ts                   (changed — 7 new export lines)
```

## Component reference table

| Directory | Component | Renders | Key API |
| --- | --- | --- | --- |
| `pagination/` | `<Pagination>` | `<nav>` | `aria-label?: string` (default: `"pagination"`) |
| `paginationContent/` | `<PaginationContent>` | `<ul>` | `data-slot="pagination-content"` |
| `paginationItem/` | `<PaginationItem>` | `<li>` | `data-slot="pagination-item"` |
| `paginationLink/` | `<PaginationLink>` | `<a>` (or `next/link`) | `isActive?: boolean`; styled via `BUTTON_VARIANTS` |
| `paginationPrevious/` | `<PaginationPrevious>` | wraps `<PaginationLink>` | `aria-label="Go to previous page"` + `ChevronLeft` + "Previous" text |
| `paginationNext/` | `<PaginationNext>` | wraps `<PaginationLink>` | `aria-label="Go to next page"` + `ChevronRight` + "Next" text |
| `paginationEllipsis/` | `<PaginationEllipsis>` | `<span>` | `aria-hidden="true"` + SR-only "More pages" text + `MoreHorizontal` icon |

## `<PaginationLink>` and `BUTTON_VARIANTS`

`<PaginationLink>` is the only primitive with variant-based styling. It
reuses `BUTTON_VARIANTS` from
`globals/components/ui/button/constants.ts` directly — no new
`constants.ts` in `paginationLink/`.

```typescript
import { BUTTON_VARIANTS } from '@/globals/components/ui/button/constants'

const linkClassName = BUTTON_VARIANTS({
  variant: isActive ? 'outline' : 'ghost',
  size: 'icon-sm',
})
```

Active variant (`outline`) signals the current page. Inactive variant
(`ghost`) is a low-visual-weight navigation link. `size: 'icon-sm'`
gives the compact square shape appropriate for page-number items.

See [`../../decisions.md`](../../decisions.md) → "Q2 resolved: Shadcn
`<Pagination>`" and "One component per file for pagination primitives"
for rationale and rejected alternatives.

**Implementation-time check (open item):** during PR 1 authorship,
verify that `outline` / `ghost` at `size: 'icon-sm'` render correctly
against the live design. If the rendered box drifts from the Shadcn
reference, options are (a) a custom `className` pass-through, (b) a
small wrapper class, or (c) a parallel `PAGINATION_LINK_VARIANTS` as a
last resort. Default preference: stay on `BUTTON_VARIANTS`.

## `globals/components/ui/index.ts` — barrel change

Add 7 new `export *` lines at the end:

```typescript
export * from './button'
export * from './heading'
export * from './spinner'
export * from './toaster'
// PR 1 additions:
export * from './pagination'
export * from './paginationContent'
export * from './paginationItem'
export * from './paginationLink'
export * from './paginationPrevious'
export * from './paginationNext'
export * from './paginationEllipsis'
```

Consumers import from `@/globals/components/ui` — no deep imports.
Consistent with existing convention (`button/`, `heading/`, etc.).

## Icons

`ChevronLeft`, `ChevronRight`, `MoreHorizontal` — all from
`lucide-react` (already a dependency). No new icon library.

## Tests

Smoke tests only — these are pure render adapters with no internal
logic to break. Behavior coverage lives in PR 3's feature-wrapper test.

Full test plan: [`../testing-strategy.md`](../testing-strategy.md) →
"PR 1 tests".

Key assertions per component:

| Component | Critical assertion |
| --- | --- |
| `<Pagination>` | Renders `<nav>` with default + overridable `aria-label` |
| `<PaginationContent>` | Renders `<ul>` with `data-slot="pagination-content"` |
| `<PaginationItem>` | Renders `<li>` with `data-slot="pagination-item"` |
| `<PaginationLink>` | `isActive={true}` → `aria-current="page"`; `isActive={false}` (default) → no `aria-current`; `href` forwarded |
| `<PaginationPrevious>` | `aria-label="Go to previous page"`, visible "Previous" text, `ChevronLeft` present |
| `<PaginationNext>` | `aria-label="Go to next page"`, visible "Next" text, `ChevronRight` present |
| `<PaginationEllipsis>` | `aria-hidden="true"`, SR-only "More pages", `MoreHorizontal` present |

## Scope boundary

No `app/`, `features/`, `next.config.ts`, or `package.json` files
change in PR 1. Pure `globals/components/ui/` additions + 7 export
lines in the barrel.
