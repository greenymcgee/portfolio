# Design: Edit Post — PR-07 Core Structure

**Date:** 2026-05-15
**Ticket:** [EDIT-POST-7](../../discovery/edit-post/jira/pr-07.md)
**Dependencies:** EDIT-POST-1, EDIT-POST-3, EDIT-POST-4
**Blocks:** EDIT-POST-8, EDIT-POST-9

---

## Overview

Implement the core edit page structure: the route, the data-fetching RSC, the client shell,
and autosave wiring. No visible UI beyond inline scaffolding — `TitleInput`, `ActionBar`,
`SaveStateIndicator`, and `RichTextEditor` are extracted in PRs 8 and 9.

---

## Architecture

```
globals/constants/routes.ts       add ROUTES.editPost

app/posts/[id]/edit/page.tsx      sync RSC — Suspense wrapper only
  └── EditPostContent             async RSC — fetches post, passes to client
        └── EditPostClient        'use client' — form state + autosave
              ├── ActionBar placeholder  (outside <form> — extracted PR-09)
              └── <form ref={formRef}>
                    <input type="hidden" name="id" />
                    TitleInput placeholder    (extracted PR-08)
                    RichTextEditor placeholder (extracted PR-09)
```

No `EditPostFormBody` component. `TitleInput` and `RichTextEditor` are direct children
of the `<form>` element inside `EditPostClient`. Description is excluded from this form —
it lives in its own modal with a separate `useActionState` instance (PR-10).

---

## `ROUTES.editPost`

Add to `globals/constants/routes.ts`:

```ts
editPost: (id: number) => `/posts/${id}/edit`
```

---

## `page.tsx`

Sync RSC. Mirrors `app/posts/[id]/page.tsx` exactly — no auth logic, no data fetching,
just a `<Suspense>` boundary wrapping `<EditPostContent params={params} />`.

---

## `EditPostContent`

Async RSC. Thin data-fetching layer between the Suspense boundary and the client shell.

- Calls `getPost(params.id)` — returns `{ error, post }`
- Passes `post` to `<EditPostClient>`
- No auth guard, no redirect on error

**Note on 404 handling:** Not in scope for this PR. When `getPost` returns an error,
behaviour is undefined. Proper `notFound()` handling tracked as T22 in `todos.md`.

---

## `EditPostClient`

`'use client'`. Owns all mutable form state and the autosave loop.

### Auth guard

Matches `CreatePostForm` pattern exactly:

```ts
const { data: session, status } = useSession()
const permitted = useMemo(
  () => hasPermission(session?.user, 'posts', 'update'),
  [session?.user],
)

useLayoutEffect(() => {
  if (permitted || status === 'loading' || pathname === ROUTES.home) return
  router.push(ROUTES.home)
}, [pathname, permitted, router, status])
```

### Form state

`title`, `description`, `content` initialized from `post` prop on mount only — never
updated from props after mount.

### Autosave (`useActionState` + inline debounce)

Per D31 — no custom hook:

```ts
const formRef = useRef<HTMLFormElement>(null)
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

const [state, updateAction, pending] = useActionState(
  updatePost,
  { status: 'IDLE' } as UpdatePostState,
)

const cancelDebounce = () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current)
  timeoutRef.current = null
}

const flushDebounce = () => {
  cancelDebounce()
  if (formRef.current) updateAction(new FormData(formRef.current))
}
```

Each field change: `cancelDebounce()` then schedule a 1-second timeout that calls
`updateAction(new FormData(formRef.current))`.

`cancelDebounce` and `flushDebounce` are passed as props — consumed by action bar
buttons in PRs 10–11.

### Autosave display (inline for this PR)

All derived from `state` and `pending`. No mirrored state, no callbacks.

| Condition | Display |
|-----------|---------|
| `state.status === 'IDLE'` | Nothing |
| `pending` | Spinner |
| `!pending && state.status === 'SUCCESS'` | "Saved" |
| `!pending && state.status === 'ERROR'` | Error text |
| `state.threwUniqueConstraintError` | Inline error near title input |
| `state.dtoError?.fieldErrors?.content` | Inline error near editor area |

These inline implementations become `SaveStateIndicator` (PR-09) and inform `TitleInput`
error display (PR-08).

---

## Files

| Action | Path |
|--------|------|
| Modified | `globals/constants/routes.ts` |
| Created | `app/posts/[id]/edit/page.tsx` |
| Created | `features/posts/components/editPostContent/editPostContent.tsx` |
| Created | `features/posts/components/editPostClient/editPostClient.tsx` |

---

## Testing

### `page.tsx`

`default` project. Cases TBD during implementation.

### `EditPostClient`

`default` project. `const PROPS: PropsOf<typeof EditPostClient> = { ... }`.

| Case |
|------|
| Renders with `PROPS` |
| Debounce fires `updateAction` after 1 second |
| `cancelDebounce` prevents debounce from firing |
| `flushDebounce` calls `updateAction` immediately with current form data |
| Save state idle: renders nothing |
| Save state pending: renders spinner |
| Save state success: renders "Saved" |
| Save state error: renders error text |
| `threwUniqueConstraintError`: renders inline error near title input |
| `dtoError.fieldErrors.content`: renders inline error near editor |

### `EditPostContent`

Defer — test only if there is behaviour not covered by a parent component's test.

---

## Key Decisions

- **D16** — Auth guard: client-side `useLayoutEffect` in `EditPostClient`; no server-side guard in `EditPostContent`
- **D31** — Autosave via `useActionState` + inline debounce; no custom hook
- **D5** — `LexicalComposer` lifted to `EditPostClient` in PR-09, not this PR
