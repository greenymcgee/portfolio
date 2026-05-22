# Todos — edit-post

> Open items that must be resolved before or during implementation.
> Mark resolved items with the decision reference (e.g., → D3).

---

## T15: Revisit migration approach — raw SQL vs Prisma migration

**Status:** Resolved → D22 (superseded by D23)

~~Use `prisma migrate dev --create-only` to generate the migration scaffold, then
hand-edit the generated `migration.sql` to append the partial index.~~ D22 is
superseded — the migration is now fully Prisma-managed via `@unique` on
`Post.title`. See D23.

---

## T0: Publish/Unpublish navigation behavior

**Status:** Resolved → D9

Publish redirects to the post detail page. Unpublish is an in-place toggle —
no navigation. requirements.md (Action Bar description, Flows 1, 5, 6) updated.

---

## T0b: New plan for the auto-saved title problem

**Status:** Resolved → D8 confirmed; D1 superseded by D23

Timestamped placeholder title approach stands (D8). The partial unique index
(D1) was later replaced by a full `@unique` constraint in `schema.prisma` (D23).
"UNDER REVIEW" markers removed from D1 and D8 at this step.

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
Edit button added. Component ends up with New Post, Edit, Delete. Deferred
to PR 12 (createPost draft flow + Edit button).

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

**Status:** Resolved → D23

Full `@unique` on `Post.title` in `schema.prisma`. Migration is fully
Prisma-managed — no partial index, no `--create-only`. D1 and D22 superseded.

---

## T17: Relax UpdatePostDto validation — description and content are optional

**Status:** Resolved → D26 (supersedes D25)

`id` (`coerce.number().int().min(1)`) and `title` (`string().min(1)`) are
required. `description` and `content` are optional/nullable with transform to
`''`. Updated: `services.md`, `testing-strategy.md`, `pr-04.md`.

---

## T18: Restructure rollout — defer /posts/new deletion; move rename and modal earlier

**Status:** Resolved → D24

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

**Status:** Resolved → D27

~~The current design triggers autosave 1 second after the modal closes.~~ Modal
now uses a manual Save + Cancel pattern (Option A). Save calls `updatePost`
directly, on success updates `EditPostClient.description` + calls
`cancelPendingDebounce` + closes. Cancel discards temp state with no save.
Updated: `components.md`, `state-management.md`, `jira/pr-10.md`.

---

## T21: Revise `useAutoSave` call-site plan — `onSave` wiring is underspecified

**Status:** Resolved → D31

`useAutoSave` custom hook removed. `EditPostClient` uses `useActionState(updatePost, initialState)` with inline debounce via `useRef` + `setTimeout`. All autosave display derived from `state` and `pending` directly. `DescriptionModal` owns its own `useActionState(withCallbacks(updatePost, { onSuccess }), initialState)` instance for auto-close. Updated: `state-management.md`, `pr-07.md`, `components.md`, `pr-10.md`, `pr-04.md`.

---

## T23: Breadcrumbs for `/posts/[id]` and `/posts/[id]/edit`

**Status:** Open

Add [shadcn Breadcrumb](https://ui.shadcn.com/docs/components/radix/breadcrumb) to both the post page and the edit page. Needs its own PR — install the component and wire it up to both pages in the same PR.

---

## T24: Conditional `<SiteNavbar />` display

**Status:** Open

`<SiteNavbar />` should not render on `/login`, `/posts/[id]`, or `/posts/[id]/edit`. `<AdminMenuDialog />` must still appear on the two post pages. Needs a plan/decision before implementation.

---

## T25: Skeleton and error states for the edit page

**Status:** Resolved → D35

Split into two new PRs:
- **PR 14** — error handling: `notFound()` for missing posts + `not-found.tsx`. Generic error UI already exists; PR 14 adds the not-found path. Requires issue #157 first.
- **PR 15** — loading skeleton: deferred until the full page layout is stable (after PR 9) to avoid rework.

---

## T22: 404 handling for the edit page

**Status:** Resolved → D35 (absorbed into PR 14)

`EditPostContent` currently passes `post` to `EditPostClient` with no handling for the
error case (post not found or `getPost` failure). When the post doesn't exist, `post`
will be `null` and `EditPostClient` will receive invalid initial state.

Add proper 404 handling to `EditPostContent`: call Next.js `notFound()` when `getPost`
returns a not-found error, and wire up a `not-found.tsx` at the
`app/posts/[id]/edit/` route segment. Requires issue #157 to be resolved first.

---

## T20: Move unpublished filter earlier in the rollout sequence

**Status:** Resolved → D24

The unpublished toggle is currently PR 12 (last). The admin needs visibility
into unpublished posts throughout the entire edit page build — not just after
it is complete. The filter should land soon after the migration so the admin
can always see unpublished drafts.

Target position: immediately after PR 1 (migration) or after PR 2
(updatePost), before any frontend edit page work begins.

Impacts: `rollout-strategy.md`, `status.md` PR checklist, Jira tickets
EDIT-POST-3 and EDIT-POST-12 (sequence and `blocks`/`dependencies` fields).
