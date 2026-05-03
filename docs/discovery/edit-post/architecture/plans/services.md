# Services — edit-post

_Source: [`../architecture.md`](../architecture.md) § Services / Workers_

## `PostService.update` (new)

- Calls `authenticateAPISession()` then `authorizeUser(token, 'posts', 'update')`.
- Delegates to `PostRepository.update({ id, title, description, content })`.
- Returns `ResultAsync<Post, UniqueConstraintError | UnknownError>`.
- **Never writes `publishedAt`.**
- **Required fields:** `id` (`coerce.number().int().min(1)`) and `title` (`string().min(1)`). `description` and `content` are optional/nullable — absent fields are coerced to `''` by the schema transform. Autosave fires before description or rich-text content is entered, but the post always has a title (placeholder on creation), so requiring title is safe.

## `PostService.publish` (new)

- Calls `authenticateAPISession()` then `authorizeUser(token, 'posts', 'publish')`.
- When `publishing: true`: validates title, description, and content are non-empty before proceeding.
- When `publishing: false`: skips content validation; `publishedAt` is set to `null`.
- Delegates to `PostRepository.publish({ id, title, description, content, publishedAt })`.
- Returns `ResultAsync<Post, ValidationError | UnknownError>`.

## `PostService.findAndCount` (updated)

- Accepts `{ page?: number; unpublished?: boolean }`.
- When `unpublished` is `true`: calls `authorizeUser(token, 'posts', 'update')`
  before passing the flag to the repository.
- Repository adds `WHERE publishedAt IS NULL` when `unpublished` is set.

**Why the permission check lives here and not in `getPosts`:** `getPosts` is
wrapped in `'use cache'` — auth logic must not cross the cache boundary. The
cached function runs with no session context. See [`./security-considerations.md`](./security-considerations.md).

## `getPost` (updated — caching)

```ts
'use cache'
cacheTag(CACHE_TAGS.post)
```

**Invalidation:** `updatePost`, `publishPost`, and `deletePost` each call
`revalidateTag(CACHE_TAGS.post)`. `updatePost` and `publishPost` also call
`revalidateTag(CACHE_TAGS.posts)`. `createPost` does not need to revalidate
`CACHE_TAGS.post` — it creates a new record, so no existing cache entry exists
to invalidate.

## Repository Methods

### `PostRepository.update`

Writes `{ title, description, content }` to the `Post` row identified by `id`.
Does **not** touch `publishedAt`.

### `PostRepository.publish`

Writes `{ title, description, content, publishedAt }` atomically in a single DB
write. `publishedAt` is either a timestamp (publish) or `null` (unpublish).
This is intentionally atomic — no pre-flush of `updatePost` is required.

## Error Types

| Error | Source | Consumer |
|-------|--------|---------|
| `UniqueConstraintError` | `PostRepository.update` on title collision | `updatePost` action → save-state indicator + inline title error |
| `ValidationError` | `PostService.publish` when fields empty on publish | `publishPost` action → Sonner toast |
| `UnknownError` | Any unexpected DB/network error | Action → Sonner toast |
