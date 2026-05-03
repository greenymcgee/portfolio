# Todos — edit-post

> Open items that must be resolved before or during implementation.
> Mark resolved items with the decision reference (e.g., → D3).

---

## T15: Revisit migration approach — raw SQL vs Prisma migration

**Status:** Resolved → D22

Use `prisma migrate dev --create-only` to generate the migration scaffold, then
hand-edit the generated `migration.sql` to append the partial index. Standard
Prisma workflow; only the `WHERE`-clause index line is hand-authored.

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

---

## T16: Re-assess partial unique index on Post.title (D1)

**Status:** Open

The decision to add a partial unique index on `Post.title WHERE title != ''`
was not intentional — it was overlooked during refinement. D1 must be
revisited before PR 1 is cut.

Questions to resolve:
- Should title uniqueness be enforced at the DB level at all? If not, D1
  is reverted and the migration only drops the `content` default.
- If enforcement is desired, is a partial index still the right mechanism,
  or is application-layer validation sufficient?
- Does the timestamped placeholder approach (D8) still make sense if
  uniqueness is not enforced at the DB?

Impacts: `data-models.md`, `migration.sql`, Jira ticket EDIT-POST-1, D1, D8.

---

## T17: Relax UpdatePostDto validation — description and content are optional

**Status:** Open

`UpdatePostDto` must not error when `description` or `content` are missing.
Autosave fires continuously as the admin types, including before any
description or rich-text content has been entered. Rejecting partial state
defeats the purpose of autosaving.

The correct shape is `create-post.schema.ts` — use it as the reference for
`update-post.schema.ts`. Only `id` and `title` need to be required (or `id`
only, depending on how the create schema is shaped).

Impacts: `update-post.schema.ts`, `UpdatePostDto`, `services.md`,
`testing-strategy.md`, Jira ticket EDIT-POST-2.

---

## T18: Restructure rollout — defer /posts/new deletion; move rename and modal earlier

**Status:** Open

PR 4 (deleting `/posts/new` and `CreatePostForm`) currently lands at position
4 — far too early. The admin has no way to create posts for the duration of
PRs 5–11 (the entire edit page build). The rollout needs to:

1. Move `LegacyRichTextEditor` rename (current PR 5) and Shadcn Dialog install
   (current PR 9) to the front of the sequence — they are safe, non-breaking
   prerequisites with no user-visible impact.
2. Keep `/posts/new` alive until the edit page is completely done (all of PRs
   6–11 merged and verified).
3. Make the `/posts/new` deletion a late-stage PR that lands only after the
   edit page is fully functional.

The PR checklist in `status.md`, `rollout-strategy.md`, and all 12 Jira
tickets will need to be updated once the new sequence is agreed.

---

## T19: Description modal — replace autosave trigger with manual Save button

**Status:** Open

The current design (components.md, Jira EDIT-POST-10) triggers autosave 1
second after the description modal closes. This conflicts with the modal
having a Cancel button — cancelling should discard changes, not save them.

New behavior:
- The modal holds temporary local state initialized from the current
  description prop.
- A **Save** button in the modal: writes the temp value to a hidden form
  input (or directly updates `EditPostClient`'s `description` state), then
  calls `updatePost` manually and closes the modal.
- A **Cancel** button: discards temp state and closes the modal without saving.
- Autosave does **not** fire on modal close.

Impacts: `components.md`, `state-management.md`, Jira ticket EDIT-POST-10,
and the `DescriptionModal` acceptance criteria.

---

## T20: Move unpublished filter earlier in the rollout sequence

**Status:** Open

The unpublished toggle is currently PR 12 (last). The admin needs visibility
into unpublished posts throughout the entire edit page build — not just after
it is complete. The filter should land soon after the migration so the admin
can always see unpublished drafts.

Target position: immediately after PR 1 (migration) or after PR 2
(updatePost), before any frontend edit page work begins.

Impacts: `rollout-strategy.md`, `status.md` PR checklist, Jira tickets
EDIT-POST-3 and EDIT-POST-12 (sequence and `blocks`/`dependencies` fields).
