# Testing Strategy — edit-post

_Source: [`../architecture.md`](../architecture.md) § Testing Strategy_

## Test Project Split

| Project | Files | Environment | Parallelism |
|---------|-------|-------------|-------------|
| `db` | `*.db.test.ts` | node + real test DB | `maxWorkers: 1` |
| `default` | `*.test.ts`, `*.test.tsx` | jsdom + Prisma mock | Parallel |

## DB Tests (`*.db.test.ts`)

Real test DB, `maxWorkers: 1` to avoid parallelism issues.

| Subject | Cases |
|---------|-------|
| `UpdatePostDto` | Valid input; missing required fields; unique constraint path |
| `PublishPostDto` | Valid input; `publishing: true` validation (empty title / description / content) |
| `PostService.update` | Success; auth failure; permission failure; unique constraint |
| `PostService.publish` | Publish success; unpublish success; validation failure (empty fields on publish) |
| `PostRepository.update` | SQL round-trip: writes title, description, content; does not touch `publishedAt` |
| `PostRepository.publish` | Sets `publishedAt` on publish; sets `null` on unpublish |
| `PostService.findAndCount` | Unpublished filter present with permission; unpublished filter blocked without permission |

## Unit / Component Tests (`*.test.ts`, `*.test.tsx`)

jsdom environment.

| Subject | Cases |
|---------|-------|
| `useAutoSave` | Debounce fires after delay; `cancelPendingDebounce` prevents fire; `flushPendingDebounce` calls `onSave` immediately |
| `EditPostClient` | Renders with `PROPS`; autosave state transitions (idle → saving → saved → error); Publish button disabled states |
| `SaveStateIndicator` | All four states render correctly (`idle`, `saving`, `saved`, `error`) |
| `PublishUnpublishButton` | Disabled when any field empty; label toggles to "Publish" on unpublish success |
| `CloseButton` | Calls `flushPendingDebounce` on click; shows confirmation dialog on no-title failure |
| `DescriptionModal` | Opens on button click; closes; description changes trigger autosave |
| `PostPageAdminMenuContent` | Edit link renders with correct `href`; "New Post" renders as `<form>` not `<a>` |

## Factories & Fixtures

| Resource | Notes |
|----------|-------|
| `postFactory` | Already exists; use `.associations({ authorId: user.id })` for related fields |
| `postFactory.build({ title: '' })` | For no-title edge cases (Close failure, delete confirmation) |
| `PUBLISHED_POST` fixture | Reuse existing |
| `UNPUBLISHED_POST` fixture | Reuse existing |

## What Not to Test

- **Lexical internals** — covered by `@lexical/react` itself.
- **Shadcn Dialog internals** — Radix UI's own test suite covers focus trapping and a11y behavior.
- **Prisma migration SQL** — validated by running `pnpm dev:db:migrate` and `pnpm test:db:migrate` in PR 1.
