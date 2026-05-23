# Frontend Components — edit-post

_Source: [`../architecture.md`](../architecture.md) § Frontend_

See [`./README.md`](./README.md) for the component hierarchy and `LexicalComposer` strategy.

---

## `TitleInput`

- Auto-focused on mount.
- Styled to be invisible (no border, no background) — visually integrated with the page content.
- Feeds into `EditPostClient` state; triggers the autosave debounce.
- Inline error rendered **above** this input on unique-constraint violations (→ D12 amended by D14, D37).

---

## `SaveStateIndicator` (→ D14, D37)

Lives in `ActionBar`. Derives display entirely from `state` and `pending`:

| Condition | Display |
|-----------|---------|
| `state.status === 'IDLE'` (no save has fired this session) | "Edited [date-fns dynamic phrase]" — `formatDistanceToNow(post.updatedAt, { addSuffix: true })` e.g. "Edited 3 minutes ago" |
| `pending` | `<Spinner className="size-3" />` + "Saving..." |
| `!pending && state.status === 'SUCCESS'` | "Saved" — persists until next save cycle |
| `!pending && state.status === 'ERROR'` | **Design pending** — error display not yet designed |

Use `formatDistanceToNow` from `date-fns` (already installed) for the idle phrase. The spinner is `<Spinner className="size-3" />` (12px), using the existing `Spinner` component at `globals/components/ui/spinner/spinner.tsx`.

> **Design pending:** The following cases have not been designed:
> - Autosave error (any kind)
> - Description modal Save failure
> - Publish success — planned Sonner toast; message content not yet designed
> - Publish failure — planned Sonner toast; message content not yet designed
> - Unpublish failure — planned Sonner toast; message content not yet designed
> - Close button save failure

Unique-constraint failures render an inline error **above** the title input for field-specific guidance.

---

## `PublishUnpublishButton` (→ D3, D9, D19)

- Disabled when any of title, description, or content is empty.
- **On Publish:** cancel debounce → call `publishPost` with current form state → on success redirect to `ROUTES.post(id)`.
- **On Unpublish:** call `publishPost({ id, publishing: false, ...currentFormState })` → on success toggle label in-place. No redirect.
- On failure (either direction): Sonner toast; button label does not toggle.

---

## `CloseButton` (→ D10, D13, D37)

`CloseButton` is its own `<form action={updatePost}>` that mirrors the current
`editPostForm` values plus a `redirectPath` hidden input set to `ROUTES.post(post.id)`.

On submit:
1. Cancel pending autosave debounce (prevents a concurrent `updatePost` call).
2. Submit the form.
3. **On success:** Redirect to `ROUTES.post(post.id)`.
4. **On failure:** Design pending.

---

## `DescriptionButton` + `DescriptionModal` (→ D6)

- `DescriptionButton` in `ActionBar` opens the Shadcn `Dialog`.
- `DescriptionModal` wraps a `<textarea>` for the post description.
- `DescriptionModal` holds **temporary local state** (`localDescription`) initialised from `EditPostClient.description` when the modal opens.
- Owns its own `useActionState(withCallbacks(updatePost, { onSuccess }), ...)` instance. `withCallbacks` handles auto-close only — errors are derived from `state` directly.
- **Save changes** (button label per Figma): the modal form includes hidden inputs populated from `formRef.current` (id, title, content) plus the `<textarea>` for description. Submits to `updatePost`. On success, `withCallbacks.onSuccess` fires and closes the modal.
- **Save (failure):** Design pending.
- **Cancel:** discards temp state and closes without saving. Autosave does not fire.

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
`app/posts/new/` are deleted in PR 12.

---

## `PostPageAdminMenuContent` Update (→ D17)

Three actions after PR 12:

| Action | Implementation |
|--------|---------------|
| **New Post** | `<form action={createPost}>` (converted from `<Link href={ROUTES.newPost}>`) |
| **Edit** | `<Link href={ROUTES.editPost(post.id)}>` (new) |
| **Delete** | Existing `<form action={deletePost}>` (unchanged) |

---

## `Switch` variant prop (→ D33) — PR 5.5

`Switch` gains a `variant` prop (`'default' | 'inverted' | 'primary'`):

| Variant | Track | Thumb (off) | Thumb (on) |
|---------|-------|-------------|------------|
| `default` | `bg-subtle` (always) | `bg-background` | `bg-input` |
| `inverted` | `bg-input` (always) | `bg-subtle` | `bg-background` |
| `primary` | `bg-input` (off) / `bg-primary` (on) | existing behavior | ← same |

`default` and `inverted` are true inverses. `primary` preserves the original
Shadcn behavior in full for contexts that require a branded checked state.

---

## Unpublished Filter (→ D7, D18, D33) — PR 6 / PR 11

`PostsPageAdminMenuContent` adds an "Unpublished" toggle (`UnpublishedPostsToggle`)
that pushes `?unpublished=true` via `useRouter().push`. The toggle passes
`variant="inverted"` to `Switch` because it renders inside `AdminMenuDialog`
(`bg-foreground` = `#d9d9d9` context). Implement in PR 6.

`FindAndCountPostsDto` adds `unpublished?: string`.

`Pagination` gains `unpublished?: boolean` prop — when `true`, page links are
built as `${ROUTES.posts}?page=${N}&unpublished=true`.

`FindAndCountPostsDto` / `Pagination` changes implement in PR 11.
