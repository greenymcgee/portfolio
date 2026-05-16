# PR-07 Open Design Questions

Questions that came up during the brainstorming session. Work through these in order.

---

## Q1: `EditPostContent` — auth guard approach

**Question:** Does `EditPostContent` call `authenticateAPISession()` + `hasPermission` and redirect,
or just call `getPost` and redirect on null?

**Answer:** `EditPostContent` calls `getPost(params.id)` and passes `post` to `EditPostClient`
as initial form state (title, description, content). No auth guard, no redirect on error.
`getPost` returns `{ error, post }` — follow the established pattern; don't add a null-check
redirect. Protection comes from the proxy, the client-side `useLayoutEffect` redirect in
`EditPostClient`, and the `updatePost` auth guard. 404 handling is a future TODO (see
`todos.md`).

**Status:** ✅ Resolved

---

## Q2: `EditPostClient` — overall approach

**Question:** Does the `EditPostClient` design look right?
- `useSession` + `useLayoutEffect` belt-and-suspenders client guard
- `useActionState(updatePost, { status: 'IDLE' })` for autosave
- `formRef` + `timeoutRef` for the 1-second debounce
- `cancelDebounce` / `flushDebounce` passed as props to future action bar buttons (PRs 10–11)
- Display (save state, errors) inline for this PR — extracted in PRs 8 and 9

**Status:** ✅ Resolved

---

## Q3: Testing — scope and approach

**Question:** Does the testing plan look right?
- `EditPostClient` covered in `default` project with `PROPS` constant
- Cases: renders; debounce fires after 1s; `cancelDebounce` prevents fire;
  `flushDebounce` calls `updateAction` immediately; save state transitions
  (idle → saving → saved → error); `threwUniqueConstraintError` renders inline error;
  `dtoError.fieldErrors.content` renders inline error
- `page.tsx` will have tests
- `EditPostContent` — defer decision; test only if there's behaviour not already covered
  by a parent component's test

**Status:** ✅ Resolved
