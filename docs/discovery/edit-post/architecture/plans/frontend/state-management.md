# State Management — edit-post

_Source: [`../architecture.md`](../architecture.md) § Frontend_

## Autosave — `useActionState` + inline debounce (→ D31)

`EditPostClient` owns the `updatePost` action state:

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

const flushDebounce = () => {
  cancelDebounce()
  if (formRef.current) updateAction(new FormData(formRef.current))
}
```

On each field change: `cancelDebounce()`, then schedule a 1-second timeout. When it fires,
call `updateAction(new FormData(formRef.current))`. The form ref captures all field values
at save time without a custom helper.

`cancelDebounce` and `flushDebounce` are passed as props to `CloseButton` and
`PublishUnpublishButton`.

## Autosave State Machine

`SaveStateIndicator` and field-error displays derive from `state` and `pending` directly:

| Condition | Display |
|-----------|---------|
| `state.status === 'IDLE'` | Nothing |
| `pending` | `SaveStateIndicator` spinner |
| `!pending && state.status === 'SUCCESS'` | `SaveStateIndicator` → "Saved" |
| `!pending && state.status === 'ERROR'` | `SaveStateIndicator` error |
| `state.threwUniqueConstraintError` | `TitleInput` hard-coded error message |
| `state.dtoError?.fieldErrors?.content` | Inline errors near editor |

## Cancel and Flush

`EditPostClient` exposes two callbacks passed as props:

| Handle | Used by | Behavior |
|--------|---------|---------|
| `cancelDebounce` | `PublishUnpublishButton`, `DescriptionModal.onSaveSuccess`, `CloseButton` | Clears the timer; autosave does not fire |
| `flushDebounce` | `CloseButton` | Cancels timer, calls `updateAction` with current form data immediately |

## Form State Ownership

All mutable form state (`title`, `description`, `content`) lives in
`EditPostClient`. It is passed down to child components as props.

`EditPostClient` is initialized from the `post` prop fetched by `EditPostContent`
(the async RSC). These values are treated as the initial state only — they are
never written back after mount.

## Notification Strategy

| Event | UI response |
|-------|------------|
| Autosave in flight | `SaveStateIndicator` spinner |
| Autosave success | `SaveStateIndicator` → "Saved" |
| Autosave error — unique constraint | `SaveStateIndicator` error + `TitleInput` hard-coded message |
| Autosave error — content DTO | `SaveStateIndicator` error + inline content errors |
| Autosave error — generic | `SaveStateIndicator` error |
| Publish / Unpublish failure | Sonner toast |
| Close failure (with title) | Sonner toast |
| Close failure (no title) | Delete confirmation `Dialog` |
| Description modal Save failure — description DTO | `state.dtoError?.fieldErrors?.description` rendered in `DescriptionModal` |
| Description modal Save failure — unique constraint | Hard-coded "copy description before closing and fix the title" in `DescriptionModal` |
| Description modal Save failure — generic | Generic inline error in `DescriptionModal` |

## Description Modal State (→ D27, D31)

`DescriptionModal` owns its own `useActionState` instance. `withCallbacks` is used only for
the auto-close side effect on success:

```ts
const formRef = useRef<HTMLFormElement>(null)

const [state, modalUpdateAction, saving] = useActionState(
  withCallbacks(updatePost, {
    onSuccess: () => onSaveSuccess(localDescription),
  }),
  { status: 'IDLE' } as UpdatePostState,
)
```

`onSaveSuccess` is a prop from `EditPostClient` that updates `EditPostClient.description`,
calls `cancelDebounce`, and closes the modal. Save submits via `new FormData(formRef.current)`.

Error display is derived from `state` directly — `state.threwUniqueConstraintError` and
`state.dtoError?.fieldErrors?.description` are checked independently:

| Action | Effect |
|--------|--------|
| Open modal | `localDescription` initialised from current `EditPostClient.description` |
| Save — in flight | `saving === true` → Save button disabled |
| Save (success) | `withCallbacks.onSuccess` fires → `onSaveSuccess(localDescription)` → modal closes |
| Save (failure — unique constraint) | `state.threwUniqueConstraintError` → hard-coded "copy description before closing and fix the title" |
| Save (failure — description DTO) | `state.dtoError?.fieldErrors?.description` rendered inline |
| Save (failure — generic) | Generic inline error |
| Cancel | `localDescription` discarded; modal closes; no autosave triggered |
