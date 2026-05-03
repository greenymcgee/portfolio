# Existing Implementation — edit-post

_Source: [`../architecture.md`](../architecture.md) § Existing Implementation_

## Current Write Path: Creating Posts

1. Admin navigates to `/posts/new` — a dedicated form page.
2. `CreatePostForm` renders a title input + `RichTextEditor` with the toolbar
   embedded inside the editor component.
3. On submit, `createPost` server action calls `PostService.create`, which calls
   `PostRepository.create`. On success, `createPost` calls
   `revalidateTag(CACHE_TAGS.posts)` and redirects to `/posts`.
4. `PostService.create` calls `authenticateAPISession()` and
   `authorizeUser(token, 'posts', 'create')` before delegating to the repository.
5. `CreatePostDto` validates input with Zod. If no `content` is provided, the DB
   column default `{}` is used — a known footgun that would break the
   `RichTextEditor` if it ever actually serialized that value.

## What Does Not Exist Today

- **No `updatePost` path.** Editing a post is not possible from the UI.
- **`getPost` is not cached.**
- **No partial unique index on `Post.title`.** Multiple posts can share the same title.
- **No edit page route.** `/posts/[id]/edit` does not exist.
- **No admin filter for unpublished posts.** The posts listing always shows only published posts, even for admins.

## Files to Be Deleted (PR 4)

| File | Reason |
|------|--------|
| `app/posts/new/page.tsx` | Replaced by the edit page flow |
| `features/posts/components/createPostForm/` (and subdirectory) | No longer needed after `createPost` redirects to edit page |

## Known Issues in Existing Code

- `@default("{}")` on `Post.content` in `schema.prisma` supplies an invalid Lexical
  state if `content` is ever omitted from a `createPost` call. The migration (PR 1)
  drops this default; `CreatePostDto` will generate a valid initial state instead.
