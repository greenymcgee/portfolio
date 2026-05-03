# Initial Plan — edit-post

> Step 1 output. Analysis only — no code. See `inputs/requirements.md`
> for source of truth. Decisions log: `decisions.md`. Open architecture
> questions: `todos.md`.

## Goal

Replace the new-post page (`/posts/new`) with an edit-post page
(`/posts/[id]/edit`) that creates a draft post on button click and
immediately lands the admin in a Confluence-style editor. The editor
autosaves 1 second after the last change. A sticky action bar at the
top of the page houses the rich-text controls, a Description modal
trigger, a Publish/Unpublish toggle, and a Close button.

On the backend, a new `updatePost` action handles autosave and a
`publishPost` action handles publish/unpublish state. The `getPosts`
read path gains an admin-only `unpublished` filter that surfaces draft
posts in the posts list. The `Post` schema gets a migration: a partial
unique index on non-empty titles, and the content column drops its `{}`
default so the editor always controls its initial state.

The shape follows existing patterns:
- **Sync RSC + async child in `<Suspense>`** (`app/posts/[id]/page.tsx` +
  `PostPageContent`) — the edit page mirrors this, loading the post
  server-side before handing off to the client editor.
- **Service → Repository** (`PostService.create` / `PostRepository.create`)
  — `updatePost` follows the same pattern, including auth and permission
  checks.
- **DTO + Zod schema** (`CreatePostDto`) — `UpdatePostDto` mirrors this
  shape.

## Technical Feasibility

Feasible as a code-only change plus a single migration. Key verification
points:

- `PostService` already has `posts.update` in `POLICIES.ADMIN`, so no
  policy changes are needed. `authorizeUser` just needs 'update' added
  to its union.
- `PostRepository.findOne` is already implemented and returns
  `AuthoredPost` — the edit page can reuse `getPost` directly.
- `RichTextEditor` already accepts `editing` + `onChange` props — the
  edit page passes the same props as `CreatePostFormBody` does today.
- Autosave requires a debounce utility. No debounce package is in
  `package.json` today; one needs to be added or implemented (see
  `todos.md` → T1).
- Moving `ToolbarPlugin` to the sticky action bar requires either a
  Lexical context portal or restructuring `LexicalComposer` to wrap both
  the action bar and the editor content. This is the highest-complexity
  frontend change in the project (see `todos.md` → T2).
- The Dialog (modal) component does not exist. Shadcn's Dialog wraps
  Radix UI's Dialog, which is already an indirect dep via
  `@radix-ui/react-slot`. Adding it follows the same pattern as the
  Pagination install from the server-side-paginated-posts project.
- The partial unique index on `title` requires a raw SQL migration —
  Prisma's `@unique` attribute does not support `WHERE` clauses. The
  migration can be hand-written in the `prisma/migrations/` directory.

## Ship Plan

| PR | Scope | What lands |
|----|-------|-----------|
| 1 | Migration | Partial unique index on `Post.title` (non-empty); remove `content` column default |
| 2 | Backend: updatePost | `update-post.schema.ts`, `UpdatePostDto`, `PostRepository.update`, `PostService.update`, `updatePost` server action, tests |
| 3 | Backend: getPosts filter | `unpublished` param in schema + DTO; `PostService.findAndCount` auth check; `PostRepository.findAndCount` conditional where clause; `getPosts` action updated; tests |
| 4 | createPost flow + edit button | `createPost` creates a minimal draft and redirects to `/posts/[id]/edit`; remove `/posts/new` + `CreatePostForm` + `CreatePostFormBody`; `PostsPageAdminMenuContent` button→form; `PostPageAdminMenuContent` gains Edit button; `ROUTES` gains `editPost`; tests |
| 5 | Edit post page — core | `app/posts/[id]/edit/page.tsx` (sync RSC + Suspense); `EditPostContent` (async RSC fetches post); `EditPostClient` (client component: title input auto-focused, RTE, `useAutoSave` hook); `useLayoutEffect` redirect guard; tests |
| 6 | Title + RTE styles | Invisible title input and editor area styled to match `design-reference.png`; published-at subtitle |
| 7 | Sticky action bar + RTE controls | Action bar (sticky) added; `ToolbarPlugin` moved into it; `RichTextEditor` updated to optionally render without toolbar |
| 8 | Modal component | `globals/components/ui/dialog/` (Shadcn Dialog); tests |
| 9 | Description + Close buttons | Description modal with textarea autosaves; Close button saves and navigates; confirmation modal for no-title case (delete + redirect); tests |
| 10 | Publish/Unpublish button | `publishPost` server action; Publish/Unpublish button in action bar; disabled state when title/description/content missing; tests |
| 11 | Unpublished filter | `PostsPageAdminMenuContent` gets filter toggle; passes `?unpublished=true` through URL; `LatestPosts`/`getPosts` pass through; tests |

The split is firm: PRs 1–3 are backend only; PRs 5–11 build
incrementally on top of one another. PR 4 is the transition point that
removes `/posts/new` — it can only ship after PR 2 (since the new draft
flow calls `updatePost` during autosave) and is the PR that makes the
feature externally visible.

## Existing Patterns Reused

| Concern | Reference |
|---------|-----------|
| Sync RSC + async child in Suspense | `app/posts/[id]/page.tsx` + `PostPageContent` |
| Server action shape | `features/posts/actions/getPost.ts`, `createPost.ts` |
| DTO + Zod schema | `features/posts/dto/create-post.dto.ts` + `schemas/create-post.schema.ts` |
| Lexical content validation | `CreatePostDto.validateContentSafety()` |
| Auth + permission guard in service | `PostService.create` / `PostService.delete` → `authenticateAPISession` + `authorizeUser` |
| useLayoutEffect redirect guard | `CreatePostForm` (new post page) |
| Admin menu content pattern | `PostPageAdminMenuContent`, `PostsPageAdminMenuContent` |
| revalidateTag invalidation | `deletePost` (from server-side-paginated-posts project) |

## Key Dependencies

- Migration (PR 1) gates everything — the partial unique index must land
  before `updatePost` can report unique-title errors, and removing the
  content default must land before `createPost` stops relying on it.
- `updatePost` (PR 2) gates the draft redirect in PR 4 — autosave must
  exist before we remove the old form flow.
- Modal (PR 8) gates Description and Close confirmation (PR 9).
- PR 4 is the only PR that removes user-visible functionality
  (`/posts/new`). It ships after PR 2 is live and verified.

## Risks & Unknowns

- **R1 (medium): ToolbarPlugin in the action bar.** `ToolbarPlugin`
  uses `useLexicalComposerContext`, which requires it to be a descendant
  of `LexicalComposer`. Moving it to a sticky action bar above the
  editor requires restructuring `LexicalComposer` to wrap both areas.
  See `todos.md` → T2.
- **R2 (low): Partial unique index via raw migration.** Prisma's schema
  language has no `WHERE` clause support. The migration SQL is
  hand-written; future `prisma migrate dev` runs must not overwrite it.
  The `prisma.config.ts` migration folder must be preserved.
- **R3 (low): Debounce utility absent.** No `use-debounce` in deps.
  Either add it or implement a custom hook (see `todos.md` → T1).
- **R4 (low): getPosts cache + unpublished filter.** The cached
  `getPosts` uses args as cache key. Passing `unpublished: 'true'`
  creates a separate cache entry, which is correct. Permission check
  must happen inside `PostService.findAndCount` (server boundary), not
  in the cached function (see `todos.md` → T3).
- **R5 (low): Content default removal.** `createPost` today relies on
  `@default("{}")` at the DB level; after PR 1, the action must always
  pass an initial Lexical JSON state. `CreatePostDto` must be updated
  to generate the initial editor state if no content is provided.
