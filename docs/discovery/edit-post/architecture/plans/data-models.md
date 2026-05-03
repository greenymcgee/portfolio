# Data Models — edit-post

_Source: [`../architecture.md`](../architecture.md) § Data Model_

## Database Migration (PR 1)

A fully Prisma-managed migration — no hand-authored SQL required. Workflow:

1. Remove `@default("{}")` from `Post.content` in `schema.prisma`.
2. Add `@unique` to `Post.title` in `schema.prisma`.
3. Run `prisma migrate dev` — Prisma generates and applies both changes.

Prisma generates the following `migration.sql`:

```sql
-- Remove the {} default; createPost will always supply a valid Lexical state.
ALTER TABLE "Post" ALTER COLUMN "content" DROP DEFAULT;

-- Enforce unique titles at the database level.
CREATE UNIQUE INDEX "Post_title_key" ON "Post"("title");
```

**`schema.prisma` changes:** remove `@default("{}")` from `Post.content`; add
`@unique` to `Post.title`. See [decisions.md](../decisions.md) → D23.

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

The full unique constraint covers all titles. Two simultaneous drafts opened within
the same second would produce identical timestamped placeholders and collide —
acceptable at this scale.
