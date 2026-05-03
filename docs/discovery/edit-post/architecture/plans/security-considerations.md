# Security Considerations — edit-post

_Source: [`../architecture.md`](../architecture.md) § Security Considerations_

## Edit Page Route Guard (→ D16)

`app/posts/[id]/edit/page.tsx` is an async RSC. It calls
`authenticateAPISession()` and `hasPermission(token.user, 'posts', 'update')`
before rendering. Failure → `redirect(ROUTES.home)`.

`EditPostClient` additionally implements a `useLayoutEffect` guard mirroring
the existing `CreatePostForm` pattern as belt-and-suspenders protection against
client-side session expiry after initial load.

**Implement in:** PR 6.

## Server Action Authorization

| Action | Permission required | Already in `POLICIES.ADMIN`? |
|--------|--------------------|-----------------------------|
| `updatePost` | `posts.update` | Yes |
| `publishPost` | `posts.publish` | Yes |
| `getPosts` (`unpublished` flag) | `posts.update` (checked in `PostService.findAndCount`) | Yes |

The permission check for the `unpublished` flag lives in
`PostService.findAndCount`, **not** in the `'use cache'`-wrapped `getPosts`
function. Auth logic must not cross the cache boundary — the cached function runs
with no session context.

## Input Validation

All inputs are validated via Zod DTOs before reaching the service layer:

| DTO | Fields validated |
|-----|-----------------|
| `UpdatePostDto` | `id`, `title`, `description`, `content` |
| `PublishPostDto` | `id`, `publishing` (boolean), `title`, `description`, `content` |
| `FindAndCountPostsDto` | `page` (optional), `unpublished` (optional string) |

`publishPost` adds a second server-side gate: when `publishing: true`, the
service validates that `title`, `description`, and `content` are all non-empty
before proceeding, even if the client has already enforced this.

## Cache Boundary Rule

`getPost` is wrapped in `'use cache'`. No auth or session logic may be placed
inside this function — the cache entry is shared across all callers. Any
access-control decision (e.g., whether to include draft posts) must be made
in the calling service method, outside the cache boundary.
