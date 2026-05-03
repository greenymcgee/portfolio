# Frontend Components — edit-post

_Source: [`../architecture.md`](../architecture.md) § Frontend_

See [`./README.md`](./README.md) for the component hierarchy and `LexicalComposer` strategy.

---

## `TitleInput`

- Auto-focused on mount.
- Styled to be invisible (no border, no background) — visually integrated with the page content.
- Feeds into `EditPostClient` state; triggers autosave via `useAutoSave`.
- Inline error rendered below this input on unique-constraint violations (→ D12 amended by D14).

---

## `PublishedAtSubtitle` (→ D15)

Static `<time>` element set once on page load using the existing `Time` component.

| Post state | Value shown |
|-----------|------------|
| Draft | Current date/time captured at render time |
| Published | Actual `publishedAt` value from the DB |

**Format:** `"MMMM do, yyyy 'at' h:mm a"` — e.g. `May 3rd, 2026 at 10:30 AM`

---

## `SaveStateIndicator` (→ D14)

Lives in `ActionBar`. Four states:

| State | Display |
|-------|---------|
| `idle` (no autosave has fired this session) | Nothing |
| `saving` | Spinner only |
| `saved` | "Saved" — persists until next save cycle |
| `error` | Inline error text |

All autosave errors route through the indicator. Sonner is reserved for
publish, unpublish, and close failures only.

Unique-constraint failures additionally render an inline error below the
title input for field-specific guidance (alongside the indicator error).

---

## `PublishUnpublishButton` (→ D3, D9, D19)

- Disabled when any of title, description, or content is empty.
- **On Publish:** cancel debounce → call `publishPost` with current form state → on success redirect to `ROUTES.post(id)`.
- **On Unpublish:** call `publishPost({ id, publishing: false, ...currentFormState })` → on success toggle label in-place. No redirect.
- On failure (either direction): Sonner toast; button label does not toggle.

---

## `CloseButton` (→ D10, D13)

1. Cancel pending debounce.
2. Call `updatePost` directly (flush).
3. **On success:** redirect to `ROUTES.post(id)`.
4. **On failure with no title:** show delete confirmation `Dialog` (delete post → redirect to `ROUTES.posts`).
5. **On failure with a title:** Sonner error; admin stays on the edit page.

---

## `DescriptionButton` + `DescriptionModal` (→ D6)

- `DescriptionButton` in `ActionBar` opens the Shadcn `Dialog`.
- `DescriptionModal` wraps a `<textarea>` for the post description.
- `DescriptionModal` holds **temporary local state** (`localDescription`) initialised from `EditPostClient.description` when the modal opens.
- **Save:** calls `updatePost` with `{ id, title, description: localDescription, content }` → on success updates `EditPostClient.description` + calls `cancelPendingDebounce` + closes the modal. Inline error shown in modal on failure.
- **Cancel:** discards temp state and closes without saving. Autosave does not fire.
- `EditPostClient.description` is still included in every `publishPost` call and in any subsequent autosave triggered by title or content changes.

Shadcn `Dialog` is installed via `npx shadcn add dialog` and split into
one-component-per-directory under `globals/components/ui/dialog/` to match
existing conventions (PR 9).

---

## `createPost` Update (→ D8)

`createPost` calls `PostService.create` with:
- **`title`:** timestamped placeholder — e.g. `"Untitled — 2026-05-02 10:30:45"`
- **`content`:** result of `createHeadlessBlogEditor()` serialized to JSON
- **`description`:** `""`

On success, redirects to `ROUTES.editPost(post.id)`. `ROUTES.newPost` and
`app/posts/new/` are deleted in PR 4.

---

## `PostPageAdminMenuContent` Update (→ D17)

Three actions after PR 4:

| Action | Implementation |
|--------|---------------|
| **New Post** | `<form action={createPost}>` (converted from `<Link href={ROUTES.newPost}>`) |
| **Edit** | `<Link href={ROUTES.editPost(post.id)}>` (new) |
| **Delete** | Existing `<form action={deletePost}>` (unchanged) |

---

## Unpublished Filter (→ D7, D18)

`PostsPageAdminMenuContent` adds an "Unpublished" toggle that pushes
`?unpublished=true` via `useRouter().push`.

`FindAndCountPostsDto` adds `unpublished?: string`.

`Pagination` gains `unpublished?: boolean` prop — when `true`, page links are
built as `${ROUTES.posts}?page=${N}&unpublished=true`.

Implement in PR 12.
