# State Management — edit-post

_Source: [`../architecture.md`](../architecture.md) § Frontend_

## Autosave — `useActionState` + inline debounce (→ D31)

`EditPostForm` owns the `updatePost` action state:

```ts
const [state, updateAction, pending] = useActionState(
  updatePost,
  { status: 'IDLE' } as UpdatePostState,
)
```

All autosave display is derived directly from `state` and `pending` — no callbacks,
no mirrored state.

**Inline debounce (`useRef` + `setTimeout`, no custom hook):**

```ts
const formRef = useRef<HTMLFormElement>(null)
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

const cancelDebounce = () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current)
  timeoutRef.current = null
}

```

On each field change: `cancelDebounce()`, then schedule a 1-second timeout. When it fires,
call `updateAction(new FormData(formRef.current))`. The form ref captures all field values
at save time without a custom helper.

`cancelDebounce` is passed as a prop to `CloseButton` and `PublishUnpublishButton`.

## Autosave State Machine

`AutoSaveStatus` and field-error displays derive from `state` and `pending` directly:

| Condition | Display |
|-----------|---------|
| `state.status === 'IDLE'` | `AutoSaveStatus` → "Edited [date-fns phrase]" from `post.updatedAt` |
| `pending` | `AutoSaveStatus` spinner + "Saving..." |
| `!pending && state.status === 'SUCCESS'` | `AutoSaveStatus` → "Saved" |
| `!pending && state.status === 'ERROR'` | `AutoSaveStatus` → "Updates not saved" (destructive red) |
| `state.threwUniqueConstraintError` | `TitleInput` hard-coded error message **above** the input |
| `state.dtoError?.fieldErrors?.content` | Inline errors near editor |

## Cancel Debounce

The parent form component exposes `cancelDebounce` as a prop to children that trigger their own save:

| Handle | Used by | Behavior |
|--------|---------|---------|
| `cancelDebounce` | `PublishUnpublishButton`, `DescriptionModal`, `CloseButton` | Clears the timer; autosave does not fire |

## Form State Ownership

`EditPostContent` holds the `formRef` and passes it down to `EditPostForm` (the
actual `<form>` element). `CloseButton` and `DescriptionModal` receive this
`formRef` and read `formRef.current` to populate their hidden inputs at submit time.

`EditPostContent` is initialized from the `post` prop fetched server-side.
These values are treated as the initial state only — they are never written back
after mount.

## Notification Strategy

| Event | UI response |
|-------|------------|
| Autosave in flight | `AutoSaveStatus` spinner + "Saving..." |
| Autosave success | `AutoSaveStatus` → "Saved" |
| Autosave error (any kind) | `AutoSaveStatus` → "Updates not saved" (destructive red) + Sonner toast: "Post could not be saved" |
| Unique constraint violation | `TitleInput` hard-coded error message **above** the input |
| Publish success | Sonner toast: "Success!" + redirect to post page |
| Publish failure | Sonner toast: "Post could not be published" |
| Unpublish success | Sonner toast: "Success!" + label toggles in-place; no redirect |
| Unpublish failure | Sonner toast: "Post could not be unpublished" |
| Close success | Redirect to post page |
| Close failure | "There are unsaved changes" dialog — Cancel (stay) or Close (`<Link href={ROUTES.post(post.id)}>` — navigates away without saving) |
| Description modal Save success | Modal closes |
| Description modal Save failure (Zod) | Bullet list in red below "Description" label |
| Description modal Save failure (generic) | "Something went wrong" in red below "Description" label |

## Description Modal State (→ D27, D31)

`DescriptionModal` owns its own `useActionState` instance. `withCallbacks` is used only for
the auto-close side effect on success:

```ts
const formRef = useRef<HTMLFormElement>(null)

const [state, modalUpdateAction, saving] = useActionState(
  withCallbacks(updatePost, {
    onSuccess: closeModal,
  }),
  { status: 'IDLE' } as UpdatePostState,
)
```

Save submits via `new FormData(formRef.current)`. On success, `withCallbacks.onSuccess` closes the modal.

Error display is derived from `state` directly — `state.threwUniqueConstraintError` and
`state.dtoError?.fieldErrors?.description` are checked independently:

| Action | Effect |
|--------|--------|
| Open modal | `localDescription` initialised from the description hidden input (`formRef.current`) |
| Save — in flight | `saving === true` → "Save changes" button shows inline spinner |
| Save (success) | `withCallbacks.onSuccess` fires → modal closes |
| Save (failure — Zod) | `state.dtoError?.fieldErrors?.description` → bullet list in red below "Description" label |
| Save (failure — generic) | "Something went wrong" in red below "Description" label |
| Cancel | `localDescription` discarded; modal closes; no autosave triggered |
