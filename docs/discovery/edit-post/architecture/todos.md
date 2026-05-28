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
`EditPostForm` as belt-and-suspenders. Implement in PR 5.

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
`EditPostForm` owns the `LexicalComposer`.

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
directly, on success closes the modal. Cancel discards temp state with no save.
Updated: `components.md`, `state-management.md`, `jira/pr-10.md`.

---

## T21: Revise `useAutoSave` call-site plan — `onSave` wiring is underspecified

**Status:** Resolved → D31

`useAutoSave` custom hook removed. `EditPostForm` uses `useActionState(updatePost, initialState)` with inline debounce via `useRef` + `setTimeout`. All autosave display derived from `state` and `pending` directly. `DescriptionModal` owns its own `useActionState(withCallbacks(updatePost, { onSuccess }), initialState)` instance for auto-close. Updated: `state-management.md`, `pr-07.md`, `components.md`, `pr-10.md`, `pr-04.md`.

---

## T26: Skeleton component install + implementation-time discovery

**Status:** Open

No `Skeleton` component exists in the project yet. Install via `npx shadcn add skeleton` and split into one-component-per-directory under `globals/components/ui/skeleton/` to match existing conventions.

The Figma skeleton (screen 3, node 527:1568) shows `bg-border` rectangles as a starting point only. Actual region shapes, heights, and spacing must be determined at implementation time to match the final page layout (after PR 9). Deferred until after PR 9 per D35.

Impacts: `jira/pr-15.md` acceptance criteria.

---

## T27: Name and document the `EditPostContent` form state wrapper

**Status:** Open

`EditPostContent` holds the `formRef` and passes it to `EditPostForm`. `CloseButton` and `DescriptionModal` receive `formRef` and read `formRef.current` to populate hidden inputs at submit time. The component boundaries, prop contracts, and `cancelDebounce` threading need to be documented before PR 7 work is extended.

Impacts: `frontend/state-management.md`, `frontend/components.md`, `frontend/README.md` component tree, relevant Jira tickets.

---

## T29: Link design-map screens to the PRs that implement them

**Status:** Open

Each Jira ticket should reference the specific `inputs/design-map.md` screen numbers that govern its implementation, so implementors can open the exact Figma frames without hunting through the full design map.

Mapping to work through:

| PR | Relevant screens |
|----|-----------------|
| PR-06 | 2 (published/unpublished toggle) |
| PR-08 | 1, 6, 7, 8 |
| PR-09 | 9, 10, 13, 14, 15 |
| PR-10 | 5, 16, 17, 21, 22, 23, 24 |
| PR-11 | 2, 18, 19, 20, 25 |
| PR-12 | 1 |
| PR-14 | 11, 12 |
| PR-15 | 3 |
| PR-16 | 11 |

Impacts: all Jira ticket files listed above.

---

## T32: Description modal save does not update the main form state

**Status:** Resolved → D45

`withCallbacks.onSuccess` imperatively updates the description hidden input via `formRef.current.elements.namedItem('description')` before closing the modal. Documented in `jira/pr-10.md` technical notes and acceptance criteria.

---

## T31: Split PR-11 into separate frontend and backend tickets

**Status:** Resolved → D41

EDIT-POST-11 retains the backend scope. EDIT-POST-17 (new) covers `PublishUnpublishButton` and `ActionBar` integration. See `decisions.md` → D41.

---

## T30: Ticket refinement and potential breakdown review

**Status:** Resolved → D46

With all designs now confirmed (D39), each ticket needs a review pass to:
1. Verify no implementation details are missing or still vague.
2. Assess whether any ticket is large enough to warrant splitting.
3. Ensure acceptance criteria are concrete and testable — no placeholders remain.

Done: PR-08, PR-09 (refined), PR-10 (split → EDIT-POST-10 Description only + EDIT-POST-19 Close Button), PR-11 (`redirectUrl` → `redirectPath` fixed → D44), PR-18 (added), PR-12, PR-14, PR-15, PR-16 (all refined 2026-05-27 → D46 for PR-12 scope change).

---

## T28: Revisit architecture and Jira tickets once pending designs are provided

**Status:** Resolved → D39

All pending design items (screens 13–25) were added to the Figma file and reviewed on 2026-05-24. `components.md`, `state-management.md`, and Jira tickets PR-08 through PR-11 have been updated with confirmed specs. `design-pending.md` cleared.

---

## T23: Breadcrumbs for `/posts/[id]` and `/posts/[id]/edit`

**Status:** Cancelled → D38

Breadcrumbs will not be added to the post page or the edit page for this project.

---

## T24: Conditional `<SiteNavbar />` display

**Status:** Resolved → D47, D48

`SiteNavbar` is rendered opt-in at each call site. `ClientSiteNavbar` and `usePathname` are removed. Pages that need the navbar render it directly with a server-side pathname. PR-20 covers the refactor.

---

## T25: Skeleton and error states for the edit page

**Status:** Resolved → D35

Split into two new PRs:
- **PR 14** — error handling: `notFound()` for missing posts + `not-found.tsx`. Generic error UI already exists; PR 14 adds the not-found path. Requires issue #157 first.
- **PR 15** — loading skeleton: deferred until the full page layout is stable (after PR 9) to avoid rework.

---

## T22: 404 handling for the edit page

**Status:** Resolved → D35 (absorbed into PR 14)

`EditPostContent` currently passes `post` to `EditPostForm` with no handling for the
error case (post not found or `getPost` failure). When the post doesn't exist, `post`
will be `null` and `EditPostForm` will receive invalid initial state.

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
