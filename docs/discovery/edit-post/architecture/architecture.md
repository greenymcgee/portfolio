# Edit Post — Architecture & Design Document

_Technical architecture and design details. For project planning and requirements, see `inputs/requirements.md`._

## Document Info

| Field | Value |
|-------|-------|
| **Requirements** | `inputs/requirements.md` |
| **Author** | greenymcgee |
| **Status** | Draft |
| **Decisions log** | `decisions.md` |

---

## Project Overview

The edit-post project replaces the `/posts/new` form page with a Confluence-style
inline editor at `/posts/[id]/edit`. Clicking "New Post" creates a minimal draft
immediately and redirects the admin to the editor; there is no intermediate form.
The editor autosaves 1 second after the last change. A sticky action bar houses
the rich-text controls, a Description modal trigger, a Publish/Unpublish toggle,
and a Close button.

On the backend, a new `updatePost` action handles autosave and a `publishPost`
action handles publish/unpublish state. The `getPosts` read path gains an
admin-only `?unpublished=true` filter. The `Post` table receives a migration:
a `@unique` constraint on `Post.title`, and the `content` column drops its
`{}` default.

**Personas:** Admin only. Anonymous users are unaffected — they continue to see
only published posts via the existing `getPosts` path.

---

## Existing Implementation

The current write path for creating posts:

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

There is no `updatePost` path today. Editing a post is not possible from the UI.
`getPost` is not cached.

---

## Proposed Solution

Two new server actions (`updatePost`, `publishPost`) and one new page
(`/posts/[id]/edit`) form the core of the feature. The existing `createPost`
action is updated to create a minimal draft and redirect to the edit page rather
than to a form. The existing `/posts/new` page and `CreatePostForm` are deleted.

**Backend components:**
- `UpdatePostDto` + `update-post.schema.ts` — validates `{ id, title, description, content }`
- `PublishPostDto` + `publish-post.schema.ts` — validates `{ id, publishing: boolean, title, description, content }`
- `PostService.update` + `PostRepository.update`
- `PostService.publish` + `PostRepository.publish`
- `PostService.findAndCount` — updated to accept `unpublished` flag with auth check
- `getPost` — wrapped in `'use cache'` with a new `CACHE_TAGS.post` tag
- `deletePost` — updated to also `revalidateTag(CACHE_TAGS.post)`

**Frontend components:**
- `app/posts/[id]/edit/page.tsx` — sync RSC entry point with `<Suspense>`
- `EditPostContent` — async RSC that fetches the post before rendering the client
- `EditPostClient` — client component; owns all editor state and autosave logic
- `ActionBar` — sticky top bar; contains toolbar, save indicator, and action buttons
- `ToolbarPlugin` — rendered inside `ActionBar` within the shared `LexicalComposer` owned by `EditPostClient`
- `LegacyRichTextEditor` — the existing `RichTextEditor` renamed in its own PR before the edit page work begins
- New `RichTextEditor` — purpose-built for the edit page; no embedded toolbar, no internal `LexicalComposer`; exported alongside `ToolbarPlugin` from `globals/components/richTextEditor`
- `useAutoSave` — custom debounce hook
- Shadcn `Dialog` component — new, installed via `npx shadcn add dialog`

---

## User-Facing Behavior

### Personas

| Persona | Role | Key Actions | Auth Context |
|---------|------|-------------|-------------|
| Admin | Authenticated admin | Creates, edits, publishes, and unpublishes posts | NextAuth.js v4 session; `posts.create`, `posts.update`, `posts.publish` permissions |
| User | Anonymous | Views published posts | None |

### User Flows

#### Flow 1: Creating a Post (Admin)

1. Admin opens the AdminMenuDialog on the posts page.
2. Admin clicks "New Post" — `createPost` fires as a form action.
3. `createPost` creates a minimal draft (timestamped placeholder title, empty
   Lexical state, empty description) and redirects to `/posts/[id]/edit`.
4. Admin arrives on the edit page with the title input auto-focused.
5. Admin fills in title, description (via Description modal), and content.
6. Autosave fires 1 second after each change.
7. Admin clicks "Publish" — `updatePost` flushes first, then `publishPost` fires.
8. Admin is redirected to the post detail page (`/posts/[id]`).

#### Flow 2: Editing a Post Title (Admin)

1. Admin opens the AdminMenuDialog on the post detail page.
2. Admin clicks "Edit" — navigates to `/posts/[id]/edit`.
3. Admin types in the auto-focused title input.
4. Autosave fires 1 second after the last keystroke.
5. Admin clicks "Close" — pending debounce is cancelled, `updatePost` flushes.
6. Admin is redirected to the post detail page.

#### Flow 3: Editing a Post Description (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button.
2. Admin clicks "Description" in the action bar — the Description modal opens.
3. Admin types in the textarea.
4. Admin closes the modal — description state is held in `EditPostClient`.
5. Autosave fires 1 second after the modal closes (description changed).
6. Admin clicks "Close" — `updatePost` flushes, redirect to post detail page.

#### Flow 4: Editing Post Content (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button.
2. Admin clicks in the rich-text editor area.
3. Admin uses the heading dropdown in the action bar to select h2, types a heading.
4. Admin presses enter, types a paragraph.
5. Autosave fires 1 second after the last change.
6. Admin clicks "Close" — `updatePost` flushes, redirect to post detail page.

#### Flow 5: Publishing a Post (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button.
2. Admin fills out title, description, and content (all required for publish).
3. Admin clicks "Publish" — button is enabled only when all three fields are non-empty.
4. Pending debounce is cancelled; `publishPost` fires with current form state.
5. Admin is redirected to the post detail page showing the published date.

#### Flow 6: Unpublishing a Post (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button on a published post.
2. Admin clicks "Unpublish".
3. `publishPost({ id, publishing: false, ...currentFormState })` fires — `publishedAt` is set to `null`; content fields are saved but content validation is skipped.
4. Admin stays on the edit page; the button label toggles to "Publish". No redirect.

#### Flow 7: Viewing Unpublished Posts (Admin)

1. Admin opens the AdminMenuDialog on the posts page.
2. Admin clicks the "Unpublished" toggle — router pushes `?unpublished=true`.
3. `getPosts` re-runs with `{ unpublished: 'true' }` — `PostService.findAndCount`
   checks the admin permission before including draft posts.
4. Admin sees the list of unpublished posts and can click through to any.

#### Flow 8: Duplicate Title Conflict (Admin)

1. Admin navigates to `/posts/[id]/edit`.
2. Admin types a title that already exists on another post.
3. Autosave fires — `updatePost` returns a unique-constraint error.
4. The save-state indicator shows an error; an inline error appears below the title input.
5. Admin changes the title — autosave fires again.
6. Error clears; save-state indicator shows "Saved".

### Scope Boundaries

**In scope:**
- New edit post page at `/posts/[id]/edit`
- `createPost` updated to create a minimal draft and redirect to the edit page
- `updatePost` server action (autosave)
- `publishPost` server action (publish/unpublish)
- Sticky action bar with toolbar, Description button, Publish/Unpublish, Close
- Shadcn Dialog component (used for Description modal and no-title confirmation)
- Admin-only `?unpublished=true` filter on the posts page
- `getPost` cached with `CACHE_TAGS.post`
- Edit button added to `PostPageAdminMenuContent`
- "New Post" converted from `<Link>` to `<form action={createPost}>` in both admin menu components

**Out of scope:**
- The delete flow (already implemented)
- Any changes to how anonymous users see posts
- Multi-author or collaborative editing

### Edge Cases & Error States

| Scenario | Expected Behavior |
|----------|------------------|
| Admin closes the browser / navigates away without typing a title | The timestamped placeholder draft persists. It is findable via the unpublished filter and deletable via the existing delete flow. |
| Autosave fails — unique constraint violation | Save-state indicator shows error; inline error message appears below the title input. |
| Autosave fails — generic error | Save-state indicator shows error text. No Sonner toast for autosave failures. |
| Publish fails — generic error | Sonner toast shown. Admin remains on the edit page. |
| Unpublish fails — generic error | Sonner toast shown. Button label does not toggle. |
| Close fails — generic error | Sonner toast shown. Admin remains on the edit page. |
| Close clicked with no title | Pending debounce cancelled; `updatePost` attempted; on failure with no title, delete confirmation dialog is shown. |
| Autosave and Publish fire simultaneously | Publish cancels the debounce and calls `publishPost` with current form state — no prior `updatePost` flush needed. Subsequent autosaves are safe because `updatePost` never touches `publishedAt`. (→ D20) |
| Publish button clicked with empty title, description, or content | Button is disabled client-side; `publishPost` validates server-side as a second gate. |
| Admin arrives at the edit page without a valid session | Server-side RSC redirect to home before the client component renders. `useLayoutEffect` guard fires as belt-and-suspenders. |

---

## Implementation Details

### Data Model

**Migration (PR 1)** — fully Prisma-managed. Two `schema.prisma` changes: remove
`@default("{}")` from `Post.content`; add `@unique` to `Post.title`. Prisma
generates the migration SQL:

```sql
-- Remove the {} default; createPost will always supply a valid Lexical state.
ALTER TABLE "Post" ALTER COLUMN "content" DROP DEFAULT;

-- Enforce unique titles at the database level.
CREATE UNIQUE INDEX "Post_title_key" ON "Post"("title");
```

See `decisions.md` → D23 (supersedes D1 and D22).

**New `CACHE_TAGS` entry:**

```ts
// globals/constants/cacheTags.ts
export const CACHE_TAGS = {
  posts: 'posts',
  post: 'post',   // ← new
}
```

**Data lifecycle:**
- Posts are created by `createPost` with a timestamped placeholder title and
  generated Lexical initial state.
- `updatePost` updates `{ title, description, content }` only — never `publishedAt`.
- `publishPost` sets or clears `publishedAt` only — never touches content fields.
- `deletePost` is unchanged; `revalidateTag(CACHE_TAGS.post)` is added to it.
- No new tables. No PII. No audit trail required.

**Race condition:** autosave and publish cannot race to set `publishedAt` because
`updatePost` does not touch that column.

### Security Considerations

**Edit page route guard (→ D16):**
- `app/posts/[id]/edit/page.tsx` is an async RSC. It calls
  `authenticateAPISession()` and `hasPermission(token.user, 'posts', 'update')`
  before rendering. Failure → `redirect(ROUTES.home)`.
- `EditPostClient` additionally implements `useLayoutEffect` mirroring the
  existing `CreatePostForm` pattern as a belt-and-suspenders client guard.

**Server action auth:**
- `updatePost`: requires `posts.update` permission (already in `POLICIES.ADMIN`).
- `publishPost`: requires `posts.publish` permission (already in `POLICIES.ADMIN`).
- `getPosts` (updated): the permission check for the `unpublished` flag lives in
  `PostService.findAndCount`, not in the `'use cache'`-wrapped function. Auth
  logic must not cross the cache boundary.

**Input validation:** all inputs validated via Zod DTOs before reaching the
service layer. `UpdatePostDto` validates `{ id, title, description, content }`.
`PublishPostDto` validates `{ id, publishing: boolean, title, description, content }`.

### Services / Workers

#### `PostService.update` (new)

- Calls `authenticateAPISession()` then `authorizeUser(token, 'posts', 'update')`.
- Delegates to `PostRepository.update({ id, title, description, content })`.
- Returns `ResultAsync<Post, UniqueConstraintError | UnknownError>`.

#### `PostService.publish` (new)

- Calls `authenticateAPISession()` then `authorizeUser(token, 'posts', 'publish')`.
- When `publishing: true`: validates title, description, and content are non-empty before proceeding.
- When `publishing: false`: skips content validation; `publishedAt` is set to `null`.
- Delegates to `PostRepository.publish({ id, title, description, content, publishedAt })`.
- Returns `ResultAsync<Post, ValidationError | UnknownError>`.

#### `PostService.findAndCount` (updated)

- Accepts `{ page?: number; unpublished?: boolean }`.
- When `unpublished` is `true`: calls `authorizeUser(token, 'posts', 'update')`
  before passing the flag to the repository.
- Repository adds `WHERE publishedAt IS NULL` when `unpublished` is set.

#### `getPost` (updated — caching)

```ts
'use cache'
cacheTag(CACHE_TAGS.post)
```

**Invalidation:** `updatePost`, `publishPost`, and `deletePost` each call
`revalidateTag(CACHE_TAGS.post)`. `updatePost` and `publishPost` also call
`revalidateTag(CACHE_TAGS.posts)`. `createPost` does not need to revalidate
`CACHE_TAGS.post` — it creates a new record.

### Frontend

#### Component Hierarchy

```
app/posts/[id]/edit/page.tsx          ← sync RSC; auth guard; <Suspense>
  └── EditPostContent                 ← async RSC; fetches post via getPost
        └── LexicalComposer           ← single composer wraps entire page
              └── EditPostClient      ← 'use client'; owns all editor state
                    ├── ActionBar (sticky)
                    │     ├── ToolbarPlugin      ← inside LexicalComposer context
                    │     ├── SaveStateIndicator
                    │     ├── DescriptionButton  → DescriptionModal (Dialog)
                    │     ├── PublishUnpublishButton
                    │     └── CloseButton
                    ├── TitleInput               ← auto-focused on mount
                    ├── PublishedAtSubtitle       ← static <time>, set on load
                    └── RichTextEditor
```

#### `LexicalComposer` strategy (→ D5, D21)

`ToolbarPlugin` uses `useLexicalComposerContext()` and must be a descendant of
the same `LexicalComposer` as the editor content. `EditPostClient` owns and
renders the `LexicalComposer`, wrapping both `ActionBar` (which contains
`ToolbarPlugin`) and the new `RichTextEditor`.

The new `RichTextEditor` is purpose-built for this page: no internal
`LexicalComposer`, no embedded `ToolbarPlugin`. `ToolbarPlugin` is exported
alongside `RichTextEditor` from `globals/components/richTextEditor/index.ts`.

The existing `RichTextEditor` is renamed `LegacyRichTextEditor` in a dedicated
PR (PR 5 in the rollout) before the edit page work begins. It is otherwise
unchanged — existing consumers are unaffected. The new `RichTextEditor` becomes
the foundation going forward.

#### `useAutoSave` hook (→ D4)

Custom hook using `useRef` + `setTimeout` / `clearTimeout`. No new dependency.
Interface:

```ts
useAutoSave({
  fields: { title, description, content },
  delay: 1000,
  onSave: (fields) => startTransition(() => updatePost(fields)),
})
// Returns: { cancelPendingDebounce, flushPendingDebounce }
```

`startTransition` keeps autosave non-blocking so the UI remains responsive.

#### Save-state indicator (→ D14)

Lives in the `ActionBar`. Four states:

| State | Display |
|-------|---------|
| `idle` (no autosave has fired this session) | Nothing |
| `saving` | Spinner only |
| `saved` | "Saved" — persists until next save cycle |
| `error` | Inline error text |

All autosave errors route through the indicator. Sonner is reserved for
publish, unpublish, and close failures only.

Unique-constraint failures additionally render an inline error below the title
input (field-specific guidance) alongside the indicator error (→ D12 amended by D14).

#### Publish/Unpublish button (→ D3, D9, D19)

- Disabled when any of title, description, or content is empty.
- On Publish click: cancel debounce → call `publishPost` with current form state → on success redirect to `ROUTES.post(id)`.
- On Unpublish click: call `publishPost({ id, publish: false })` → on success
  toggle label in-place. No redirect.

#### Close button (→ D10, D13)

- Cancel pending debounce → call `updatePost` directly.
- On success: redirect to `ROUTES.post(id)`.
- On failure with no title: show delete confirmation `Dialog` (delete post →
  redirect to `ROUTES.posts`).
- On failure with a title: show Sonner error; admin stays on the edit page.

#### Description modal (→ D6)

Shadcn `Dialog` component installed via `npx shadcn add dialog`. Split into
one-component-per-directory under `globals/components/ui/` to match existing
conventions. Description state is held in `EditPostClient` and included in every
`updatePost` / `publishPost` call.

#### `publishedAt` subtitle (→ D15)

Static `<time>` element set once on page load using the existing `Time`
component. Format: `"MMMM do, yyyy 'at' h:mm a"` (e.g. `May 3rd, 2026 at
10:30 AM`). Draft posts show current date/time captured at render time;
published posts show the actual `publishedAt` value.

#### `createPost` update (→ D8)

`createPost` calls `PostService.create` with:
- `title`: timestamped placeholder (e.g. `"Untitled — 2026-05-02 10:30:45"`)
- `content`: result of `createHeadlessBlogEditor()` serialized to JSON
- `description`: `""`

On success, redirects to `ROUTES.editPost(post.id)`. `ROUTES.newPost` and
`app/posts/new/` are deleted in PR 4.

#### `PostPageAdminMenuContent` update (→ D17)

Three actions after PR 4:
1. **New Post** — `<form action={createPost}>` (converted from `<Link href={ROUTES.newPost}>`)
2. **Edit** — `<Link href={ROUTES.editPost(post.id)}>` (new)
3. **Delete** — existing `<form action={deletePost}>` (unchanged)

#### Unpublished filter (→ D7, D18)

`PostsPageAdminMenuContent` adds an "Unpublished" toggle that pushes
`?unpublished=true` via `useRouter().push`. `FindAndCountPostsDto` adds
`unpublished?: string`. The `Pagination` component gains `unpublished?: boolean`
prop — when `true`, page links are built as
`${ROUTES.posts}?page=${N}&unpublished=true`.

### Icon & Asset Mapping

| UI Element | Icon | Library | Used In |
|-----------|------|---------|---------|
| Edit button | `SquarePen` | lucide-react | `PostPageAdminMenuContent` |

### Testing Strategy

**DB tests (`*.db.test.ts`) — real test DB, `maxWorkers: 1`:**
- `UpdatePostDto` — valid input, missing fields, unique constraint path
- `PublishPostDto` — valid input, `publish: true` validation (empty title/description/content)
- `PostService.update` — success, auth failure, permission failure, unique constraint
- `PostService.publish` — publish success, unpublish success, validation failure
- `PostRepository.update` — SQL round-trip
- `PostRepository.publish` — sets / clears `publishedAt`
- `PostService.findAndCount` — unpublished filter: with and without permission

**Unit/component tests (`*.test.ts`, `*.test.tsx`) — jsdom:**
- `useAutoSave` — debounce fires after delay; cancel prevents fire; flush calls `onSave` immediately
- `EditPostClient` — renders with `PROPS`; autosave state transitions; Publish button disabled states
- `SaveStateIndicator` — all four states render correctly
- `PublishUnpublishButton` — disabled when fields empty; label toggles on unpublish
- `CloseButton` — calls flush on click; shows confirmation dialog on no-title failure
- `DescriptionModal` — opens and closes; description updates trigger autosave
- `PostPageAdminMenuContent` — Edit link renders; New Post renders as form

**Factories / fixtures needed:**
- `postFactory` with `associations({ authorId })` — already exists
- `postFactory.build({ title: '' })` for no-title edge cases
- `PUBLISHED_POST`, `UNPUBLISHED_POST` fixtures — reuse existing

**What not to test:**
- Lexical internals — covered by `@lexical/react` itself
- Shadcn Dialog internals — Radix UI's own test suite covers focus trapping

### Rollout Plan

| PR | Scope | Key deliverables |
|----|-------|-----------------|
| 1 | Migration | `@unique` constraint on `Post.title`; remove `content` default |
| 2 | Backend: `updatePost` | `UpdatePostDto`, `PostService.update`, `PostRepository.update`, `updatePost` action, `getPost` caching, `deletePost` cache fix, tests |
| 3 | Backend: `getPosts` filter | `unpublished` param in DTO/schema; `PostService.findAndCount` auth check; repository WHERE clause; tests |
| 4 | `createPost` + edit button | Draft redirect; remove `/posts/new`; `PostsPageAdminMenuContent` → form; `PostPageAdminMenuContent` → Edit link + form; `ROUTES.editPost`; tests |
| 5 | `LegacyRichTextEditor` rename | Rename existing `RichTextEditor` → `LegacyRichTextEditor`; update all consumers; no behaviour changes |
| 6 | Edit page — core | `page.tsx`, `EditPostContent`, `EditPostClient`, `useAutoSave`, auth guard, tests |
| 7 | Title + RTE styles | Invisible title input; editor area styles matching `design-reference.png`; `publishedAt` subtitle |
| 8 | Sticky action bar + RTE controls | `ActionBar`; new `RichTextEditor`; `ToolbarPlugin` in `ActionBar`; `LexicalComposer` in `EditPostClient` |
| 9 | Modal component | `globals/components/ui/dialog/`; Shadcn Dialog install; tests |
| 10 | Description + Close buttons | Description modal; Close flush-and-redirect; no-title confirmation dialog; tests |
| 11 | Publish/Unpublish button | `publishPost` action; `PublishUnpublishButton`; disabled state; Publish flush sequence; tests |
| 12 | Unpublished filter | `PostsPageAdminMenuContent` toggle; `Pagination` `unpublished` prop; tests |

**Hard dependencies:**
- PR 1 gates everything (index must exist before unique errors are meaningful; content default must be gone before `createPost` stops relying on it).
- PR 2 gates PR 4 (`updatePost` must exist before autosave is wired up).
- PR 5 gates PR 6–8 (`LegacyRichTextEditor` rename must land before any edit page work touches `RichTextEditor`).
- PR 9 gates PR 10 (Dialog must exist before Description modal and confirmation dialog).
- PR 4 is the only PR that removes user-visible functionality (`/posts/new`) — ship after PR 2 is verified.

**Rollback:** Each PR is independently revertable. PRs 1–3 are backend-only with no user-visible changes. The feature becomes externally visible in PR 4 when `/posts/new` is removed.

---

## Risks / Open Questions

| Risk | Severity | Mitigation |
|------|----------|-----------|
| R1: `ToolbarPlugin` in the action bar requires `LexicalComposer` to wrap both areas — highest frontend complexity | Medium | Decided (→ D5, D21): `EditPostClient` owns the `LexicalComposer`. New `RichTextEditor` has no internal composer. Existing consumers use `LegacyRichTextEditor` unchanged. |
| R2: ~~Partial unique index via raw SQL migration~~ | — | Resolved → D23. Full `@unique` on `Post.title` in `schema.prisma`; migration is fully Prisma-managed. |
| R3: `createPost` relied on `@default("{}")` at the DB level | Low | Decided (→ D2): `CreatePostDto` generates the initial Lexical state when no `content` is provided. Migration drops the default in PR 1. |
| R4: `getPosts` cache + unpublished filter create two cache entries | Low | Decided (→ D7, D11): both entries are tagged `'posts'`; `revalidateTag('posts')` invalidates both. |
| R5: Autosave / Publish race condition | Low | Decided (→ D20): Publish cancels the debounce and calls `publishPost` directly with current form state. `updatePost` never touches `publishedAt`, so no subsequent autosave can clear the published state. |

---

## References

- Requirements: `inputs/requirements.md`
- Constraints: `inputs/constraints.md`
- Design reference: `inputs/design-reference.png`
- Save-state design reference (Confluence): `inputs/saved-state.png`
- Confluence reference: https://greenhouston.atlassian.net/wiki/x/AgAx
- Decisions log: `decisions.md`
- Initial plan: `initial-plan.md`
