# Data Models — edit-post

_Source: [`../architecture.md`](../architecture.md) § Data Model_

## Database Migration (PR 1)

A standard Prisma-managed migration with one hand-authored SQL statement added.
Workflow:

1. Remove `@default("{}")` from `Post.content` in `schema.prisma`.
2. Run `prisma migrate dev --create-only` — Prisma generates a timestamped
   migration directory with the schema-diff SQL (`ALTER COLUMN "content" DROP DEFAULT`).
3. Hand-edit the generated `migration.sql` to append the partial unique index
   (which Prisma's DSL cannot express):
   ```sql
   CREATE UNIQUE INDEX "Post_title_key" ON "Post" (title) WHERE title != '';
   ```
4. Run `prisma migrate dev` to apply the migration and record it in `_prisma_migrations`.

The final `migration.sql` contains both statements:

```sql
-- Remove the {} default; createPost will always supply a valid Lexical state.
ALTER TABLE "Post" ALTER COLUMN "content" DROP DEFAULT;

-- Partial unique index: enforce uniqueness only for non-empty titles.
-- Allows multiple simultaneous empty-title drafts (placeholder approach).
CREATE UNIQUE INDEX "Post_title_key" ON "Post" (title) WHERE title != '';
```

**`schema.prisma` change:** remove `@default("{}")` from `Post.content`. Do **not**
add `@unique` to `title` — Prisma's schema DSL has no `WHERE` clause support for
partial unique indexes. See [decisions.md](../decisions.md) → D22.

## New Cache Tag

```ts
// globals/constants/cacheTags.ts
export const CACHE_TAGS = {
  posts: 'posts',
  post: 'post',   // ← new
}
```

## Cache Invalidation Map

| Action | Revalidates |
|--------|------------|
| `createPost` | `CACHE_TAGS.posts` only (creates a new record — `post` cache entry doesn't exist yet) |
| `updatePost` | `CACHE_TAGS.post`, `CACHE_TAGS.posts` |
| `publishPost` | `CACHE_TAGS.post`, `CACHE_TAGS.posts` |
| `deletePost` | `CACHE_TAGS.post` (added in PR 2), `CACHE_TAGS.posts` (existing) |

## Data Lifecycle

| Operation | Fields Written | `publishedAt` |
|-----------|---------------|---------------|
| `createPost` | `title` (timestamped placeholder), `content` (generated Lexical state), `description` (`""`) | Not set |
| `updatePost` | `title`, `description`, `content` | **Never touched** |
| `publishPost` (publish) | `title`, `description`, `content`, `publishedAt` | Set to `now()` |
| `publishPost` (unpublish) | `title`, `description`, `content`, `publishedAt` | Set to `null` |
| `deletePost` | — | N/A (row deleted) |

**Race condition safety:** `updatePost` never writes `publishedAt`, so an autosave
that fires after a publish cannot clear the published state. See [`../decisions.md`](../decisions.md) → D20.

## No New Tables

- No PII captured beyond what already exists.
- No audit trail required.
- No new join tables or foreign keys.

## `createPost` Initial State

`createPost` calls `PostService.create` with:

- **`title`:** timestamped placeholder — e.g. `"Untitled — 2026-05-02 10:30:45"`
- **`content`:** result of `createHeadlessBlogEditor()` serialized to JSON
- **`description`:** `""`

The partial unique index uses `WHERE title != ''`, so the timestamped placeholder
(non-empty string) is subject to the uniqueness constraint. Two simultaneous drafts
opened within the same second would collide — acceptable at this scale.
