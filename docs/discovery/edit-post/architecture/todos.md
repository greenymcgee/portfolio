# Todos — edit-post

> Open items that must be resolved before or during implementation.
> Mark resolved items with the decision reference (e.g., → D3).

---

## T0: Publish/Unpublish navigation behavior

**Status:** Resolved → D9

Publish redirects to the post detail page. Unpublish is an in-place toggle —
no navigation. requirements.md (Action Bar description, Flows 1, 5, 6) updated.

---

## T0b: New plan for the auto-saved title problem

**Status:** Resolved → D1, D8 confirmed

Timestamped placeholder title approach stands. Partial unique index
(WHERE title != '') and createPost draft flow are confirmed as designed.
"UNDER REVIEW" markers removed from D1 and D8.

---

## T1: Debounce utility approach

**Status:** Resolved → D4

Custom `useAutoSave` hook using `useRef` + `setTimeout`. No new dep.

---

## T2: ToolbarPlugin in the action bar

**Status:** Resolved → D5

Wrap the entire edit page in a single `LexicalComposer`. Render
`ToolbarPlugin` directly inside the action bar. Add `omitToolbar` prop
to `RichTextEditor`.

---

## T3: getPosts permission check placement

**Status:** Resolved → D7

Permission check for `unpublished` flag lives in `PostService.findAndCount`,
not in the cached `getPosts` function.

---

## T4: Confirm revalidation tags for updatePost / publishPost

**Status:** Resolved → D11

`getPost` will be cached with a new `CACHE_TAGS.post` tag. `updatePost` and
`publishPost` revalidate both `CACHE_TAGS.post` and `CACHE_TAGS.posts`.
`deletePost` must also be updated to revalidate `CACHE_TAGS.post`.

---

## T5: Autosave error UX details

**Status:** Resolved → D12

Inline error below the title input for unique constraint violations. Sonner
toast for all other autosave failures.

---

## T6: Close button behavior when autosave is in-flight

**Status:** Resolved → D13

Close cancels the pending debounce, calls `updatePost` directly, then
redirects on success. Shows delete confirmation if save fails with no title.

---

## T7: "Saved" status indicator

**Status:** Resolved → D14

idle: nothing. saving: spinner only. saved: "Saved" persists. error: inline
error text. All autosave errors go through the indicator; Sonner is for
publish/unpublish/close failures only (amends D12).

---

## T8: publishedAt display on edit page

**Status:** Resolved → D15

Static `<time>` set on page load. Format: `"MMMM do, yyyy 'at' h:mm a"`.
Draft shows current date/time; published shows actual publish date/time.

---

## T9: Edit page auth guard implementation

**Status:** Resolved → D16

Server-side redirect in the async RSC page + `useLayoutEffect` in
`EditPostClient` as belt-and-suspenders. Implement in PR 5.

---

## T10: PostPageAdminMenuContent "New Post" button

**Status:** Resolved → D17

"New Post" stays — converted from `<Link>` to `<form action={createPost}>`.
Edit button added. Component ends up with New Post, Edit, Delete. Implement
in PR 4.

---

## T12: Autosave / Publish race condition

**Status:** Resolved → D19

Publish cancels the debounce, flushes `updatePost`, then calls `publishPost`.
`updatePost` never touches `publishedAt` so subsequent autosaves are safe.
Implement in PR 10.

---

## T13: `PublishPostDto` and `publishPost` implementation

**Status:** Resolved → D20

`PublishPostDto` carries `{ id, publishing: boolean, title, description, content }`.
`publishPost` is atomic — saves content fields and sets/clears `publishedAt` in
one DB write. No prior `updatePost` flush needed; Publish button handler simply
cancels the debounce and calls `publishPost` with current form state.

---

## T14: `RichTextEditor` `omitToolbar` changes

**Status:** Resolved → D21

No `omitToolbar` prop. The existing `RichTextEditor` is renamed
`LegacyRichTextEditor` in PR 5. A new `RichTextEditor` purpose-built for the
edit page (no internal `LexicalComposer`, no embedded toolbar) is introduced
alongside it. `ToolbarPlugin` is re-exported from `richTextEditor/index.ts`.
`EditPostClient` owns the `LexicalComposer`.

---

## T11: Unpublished filter and pagination interaction

**Status:** Resolved → D18

`FindAndCountPostsDto` adds `unpublished?: string`. `Pagination` receives an
`unpublished?: boolean` prop and appends `&unpublished=true` to page links
when set. Implement in PR 11.
