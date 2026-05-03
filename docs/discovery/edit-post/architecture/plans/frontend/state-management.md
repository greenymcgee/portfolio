# State Management — edit-post

_Source: [`../architecture.md`](../architecture.md) § Frontend — `useAutoSave` hook_

## `useAutoSave` Hook (→ D4)

Custom hook using `useRef` + `setTimeout` / `clearTimeout`. No new dependency.

```ts
useAutoSave({
  fields: { title, description, content },
  delay: 1000,
  onSave: (fields) => startTransition(() => updatePost(fields)),
})
// Returns: { cancelPendingDebounce, flushPendingDebounce }
```

`startTransition` keeps autosave non-blocking so the UI remains responsive
while a save is in flight.

## Autosave State Machine

`EditPostClient` tracks autosave state for `SaveStateIndicator`:

| State | Transition |
|-------|-----------|
| `idle` | Initial state; no autosave has fired this session |
| `saving` | `useAutoSave.onSave` fires → state transitions to `saving` |
| `saved` | `onSave` completes successfully → state transitions to `saved`; persists |
| `error` | `onSave` returns an error result → state transitions to `error` |
| `idle` → `saving` | Any field change resets error and starts debounce |

## Cancel and Flush

`useAutoSave` exposes two imperative handles:

| Handle | Used by | Behavior |
|--------|---------|---------|
| `cancelPendingDebounce` | `PublishUnpublishButton` (on publish), `CloseButton` | Clears the timer; `onSave` is never called |
| `flushPendingDebounce` | `CloseButton` | Clears the timer and calls `onSave` immediately with current fields |

## Form State Ownership

All mutable form state (`title`, `description`, `content`) lives in
`EditPostClient`. It is passed down to child components as props.

`EditPostClient` is initialized from the `post` prop fetched by `EditPostContent`
(the async RSC). These values are treated as the initial state only — they are
never written back after mount.

## Notification Strategy

| Event | UI response |
|-------|------------|
| Autosave in flight | `SaveStateIndicator` → `saving` |
| Autosave success | `SaveStateIndicator` → `saved` |
| Autosave error — unique constraint | `SaveStateIndicator` → `error` + inline title error |
| Autosave error — generic | `SaveStateIndicator` → `error` |
| Publish / Unpublish failure | Sonner toast |
| Close failure (with title) | Sonner toast |
| Close failure (no title) | Delete confirmation `Dialog` |
