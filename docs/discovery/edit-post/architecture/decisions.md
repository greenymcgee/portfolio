# Decisions — edit-post

> Append-only. Each entry records what was decided, why, and what was
> ruled out. Never edit existing entries.

---

## D1: Partial unique index on title (not schema-level `@unique`)

**Decision:** Use a hand-written raw SQL migration to create a partial
unique index: `CREATE UNIQUE INDEX "Post_title_key" ON "Post" (title)
WHERE title != ''`. Do not add `@unique` to the Prisma schema.

**Why:** The feature allows multiple simultaneous empty-title drafts
(admin clicks "New Post" repeatedly before entering a title). A full
unique constraint would block this. A partial index enforces uniqueness
only for non-empty titles, which matches the product requirement exactly.
Prisma's schema DSL does not support `WHERE` clauses on indexes; the
index must live in a hand-authored migration.

**Ruled out:** `@unique` in `schema.prisma` — blocks multiple empty
drafts. Enforcing uniqueness only at the application layer — risks data
integrity if non-action writes occur.

---

## D2: Remove content column default; createPost generates initial state

**Decision:** The migration drops `@default("{}")` from `Post.content`.
`CreatePostDto` is updated to call `createHeadlessBlogEditor()` and
serialize the empty editor state when no `content` param is provided,
so the create action always passes a valid initial Lexical JSON string.

**Why:** The constraint doc flags the `{}` default as dangerous: "it
would actually break the RichTextEditor if it ever saved." Generating
the correct initial state in the DTO is the same pattern already used
in `validateContentSafety`. Keeping the default on the column would
require future developers to remember to never rely on it.

**Ruled out:** Keeping the column default and relying on `CreatePostDto`
to override it — leaves a latent footgun if the DTO path is ever
bypassed. Making content nullable — unnecessary schema churn; the editor
always has a valid state.

---

## D3: `updatePost` for autosave; `publishPost` for publish/unpublish

**Decision:** Two separate server actions. `updatePost` accepts `{ id,
title, description, content }` and is the autosave target. `publishPost`
accepts `{ id, publish: boolean }` — when `publish: true`, it validates
that title/description/content are non-empty before setting `publishedAt`
to `now()`; when `publish: false`, it clears `publishedAt` with no
validation.

**Why:** Mixing publish validation into `updatePost` would require the
action to know which call site triggered it (autosave vs publish button).
Separate actions have clear, single responsibilities. `PostService` and
`PostRepository` get corresponding `update` and `publish` methods.
`publishPost` maps naturally to the `posts.publish` permission already
present in `POLICIES.ADMIN`.

**Ruled out:** A single `updatePost` with a `publishedAt` field — the
action can't distinguish "autosave with existing publishedAt" from
"explicit publish request" without an extra flag, making the interface
ambiguous. A REST endpoint — all write paths in this codebase use server
actions.

---

## D4: Autosave debounce via custom hook (`useAutoSave`)

**Decision:** Implement a `useAutoSave` hook using `useRef` +
`setTimeout` / `clearTimeout` rather than adding a `use-debounce`
dependency. The hook accepts the current post fields and a 1-second
delay, and calls `startTransition(() => updatePost(...))` on the
debounced trigger.

**Why:** The debounce logic required is simple (single-value, fixed
delay). Adding `use-debounce` for a ~5-line hook adds a dep for minimal
benefit on a portfolio site. Using `startTransition` keeps the autosave
non-blocking so the UI remains responsive during the pending state.

**Ruled out:** `use-debounce` package — unnecessary dep for this scope.
Debouncing with a `useEffect` cleanup — more verbose and less reusable
than an extracted hook.

---

## D5: `LexicalComposer` wraps both action bar and editor area

**Decision:** The edit post page's client component wraps a single
`LexicalComposer` around the entire page content (action bar + editor).
`ToolbarPlugin` is lifted out of `RichTextEditor` and rendered directly
inside the action bar as a child of the same `LexicalComposer`. The
`RichTextEditor` component gains an `omitToolbar` prop that skips the
`ToolbarPlugin` render when true.

**Why:** `ToolbarPlugin` uses `useLexicalComposerContext()`, which
requires it to be a descendant of `LexicalComposer`. The only viable
approaches are (a) wrap both areas in one `LexicalComposer` or (b) use
a React Portal to teleport the plugin's output into the action bar's DOM
node. Option (a) is simpler and avoids portal complexity. Adding
`omitToolbar` to `RichTextEditor` is a backwards-compatible prop (default
`false`) that preserves current consumers.

**Ruled out:** Portal-based approach — adds complexity for no benefit in
this context. Duplicating `LexicalComposer` — two editors sharing state
is not supported by the Lexical architecture. Keeping the toolbar inside
`RichTextEditor` with CSS repositioning — fragile layout hack that would
break on scroll.

---

## D6: Shadcn Dialog for the modal component

**Decision:** Install Shadcn's Dialog component (via `npx shadcn add
dialog`) and split it into one-component-per-directory under
`globals/components/ui/` to match codebase conventions. Use it for both
the description modal and the close-without-title confirmation modal.

**Why:** Radix UI's Dialog (which Shadcn Dialog wraps) provides focus
trapping, `aria-modal`, keyboard dismissal (`Escape`), and scroll locking
out of the box. The native `<dialog>` element requires polyfill for older
browsers and manual focus management. Shadcn is already the component
approach for the project; this follows the exact same install pattern as
the Pagination primitives in the previous project. The constraint doc
asks for an accessibility audit — Radix Dialog passes WCAG 2.1 AA.

**Ruled out:** Native `<dialog>` element — requires manual focus trap
and `showModal()`/`close()` imperative API that doesn't compose cleanly
with React state. Custom modal — unnecessary when Radix solves the hard
parts correctly.

---

## D7: `?unpublished=true` URL param drives the admin filter

**Decision:** The admin "Unpublished" toggle in
`PostsPageAdminMenuContent` pushes `?unpublished=true` to the URL (via
`useRouter().push`). `getPosts` (the cached action) accepts
`{ page?: string; unpublished?: string }`. The auth/permission check for
the unpublished flag happens inside `PostService.findAndCount` — not in
the cached function — so the permission boundary is enforced at the
service layer regardless of how the function is called.

**Why:** URL state is the existing pattern for the pagination filter
(`?page=N`) and gives the admin a shareable/refreshable URL. Putting the
permission check in the service (not the cached layer) is consistent with
`create` and `delete`. The cache key naturally includes `unpublished` as
part of the args, creating distinct cache entries for
`{ unpublished: 'true' }` vs default — both tagged `'posts'` so
`revalidateTag('posts')` invalidates both.

**Ruled out:** Cookie or localStorage for filter state — not refreshable,
not linkable, inconsistent with pagination. Permission check in the
cached function — `'use cache'` boundaries should not contain auth logic
(auth depends on the request context which is not part of the cache key).

---

## D8: createPost creates a minimal draft and redirects to edit page

**Decision:** `createPost` is updated to call `PostService.create` with
an empty title, generated initial Lexical content, and empty description.
On success it redirects to `ROUTES.editPost(post.id)`. The old
`CreatePostForm`, `CreatePostFormBody`, and `app/posts/new/page.tsx` are
deleted in PR 4. `PostsPageAdminMenuContent` and
`PostPageAdminMenuContent` change the "New Post" UI from `<Link>` to a
`<form action={createPost}>` with a `<Button type="submit">`.

**Why:** The requirements state the new post page is removed entirely.
Server actions triggered by `<form>` elements are the existing pattern
(see `deletePost` in `PostPageAdminMenuContent`). No client-side JS is
required for the button — progressive enhancement works out of the box.

**Ruled out:** A client-side `fetch` call on button click — adds
unnecessary client complexity when a form action works. Keeping
`/posts/new` as a redirect to the draft — extra hop with no benefit.

---

## D9: Publish redirects to post detail page; Unpublish is an in-place toggle

**Decision:** On successful `publishPost` with `publish: true`, the server
action calls `redirect(ROUTES.post(id))` — the admin lands on the published
post detail page. On successful `publishPost` with `publish: false`, no
redirect occurs; the client receives the updated post and toggles the button
label from "Unpublish" to "Publish" in-place.

**Why:** The post detail page is the natural confirmation surface after
publishing — the admin immediately sees the live result. Unpublish is a
lower-stakes, reversible toggle; navigating away would interrupt the edit
context unnecessarily. The asymmetric behavior (redirect on publish,
in-place on unpublish) matches the product intent: publish is a "done with
this" action, unpublish is a "pause, then keep editing" action.

**Ruled out:** Redirecting to the posts list on Publish — the list view
doesn't confirm the published content. Redirecting on Unpublish — breaks
the edit flow when the admin's intent is to continue working.

---

## D10: Close redirects to post detail page

**Decision:** The "Close" button calls `updatePost` with the current field
values, then redirects to `ROUTES.post(id)` on success. No navigation to
the posts list (`/posts`).

**Why:** All editing flows (2, 3, 4) end on the post detail page — the
admin sees the result of their edits immediately. Returning to the list
would require an additional click to verify the change. The post detail
page is the canonical confirmation surface for all non-publish exits from
the editor.

**Ruled out:** Returning to the posts list — inconsistent with all three
editing flows and requires an extra click to verify the saved result.

---

## D11: `getPost` cached with a dedicated `CACHE_TAGS.post` tag

**Decision:** Add `'use cache'` and `cacheTag(CACHE_TAGS.post)` to `getPost`.
Add `post: 'post'` to the `CACHE_TAGS` constant. `updatePost` and
`publishPost` each call `revalidateTag(CACHE_TAGS.post)` and
`revalidateTag(CACHE_TAGS.posts)`. `deletePost` (already implemented) must also be updated to call
`revalidateTag(CACHE_TAGS.post)`; this fix is bundled into PR 2 alongside
`updatePost`. `createPost` does
not need to revalidate `CACHE_TAGS.post` — it creates a new record and
affects no existing detail-page caches.

**Why:** The app runs on a free server where performance is limited; caching
`getPost` reduces DB hits on every post detail page render. A dedicated `post`
tag enables targeted invalidation — writing post A evicts only post A's detail
cache, not the cached detail pages for all other posts.

**Ruled out:** Reusing `CACHE_TAGS.posts` for `getPost` — any write to a
single post would evict all other posts' detail-page caches unnecessarily.
Leaving `getPost` uncached — misses the performance improvement that motivated
this decision.

---

## D12: Autosave error UX — inline for unique constraint, toast for generic failures

**Decision:** A unique-constraint autosave failure renders an inline error
message below the title input. All other autosave failures render a `sonner`
toast.

**Why:** The unique constraint error is field-specific — the user must change
the title to resolve it, so the error belongs next to the title input. Generic
failures (network error, unknown server error) are not tied to a specific
field; a toast is consistent with the existing `deletePost` error pattern and
does not require a field to anchor to.

**Ruled out:** Toast for unique constraint — puts the error far from the field
that needs fixing. Inline error for all failures — non-field errors have no
obvious anchor point in the UI.

**Amended by D14** — Sonner is no longer used for generic autosave failures;
the save-state indicator handles all autosave error states.

---

## D13: Close button flushes pending autosave before redirecting

**Decision:** The Close button cancels the pending debounce timer and calls
`updatePost` directly with the current field values. On success it redirects
to `ROUTES.post(id)`. If `updatePost` fails and the post has no title, the
delete confirmation dialog is shown instead of redirecting. The debounce is
cancelled regardless of outcome so autosave never fires after Close is clicked.

**Why:** Redirecting with a pending debounce in flight would silently discard
the admin's most recent changes. Explicitly saving on close is the lowest-
surprise behavior. Cancelling the debounce prevents a redundant `updatePost`
call after the save already happened.

**Ruled out:** Redirect immediately without saving — risks data loss if the
admin typed after the last autosave fired. Letting the debounce run and then
redirecting — introduces a delay and a race between the debounce and the
redirect.

---

## D14: Save-state indicator states; amends D12 autosave error surface

**Decision:** The action bar contains a save-state indicator with four states:

| State | Display |
|-------|---------|
| `idle` (no autosave has fired this session) | Nothing |
| `saving` | Spinner only — no text |
| `saved` | "Saved" — persists until the next save cycle begins |
| `error` | Inline error text in the indicator area |

All autosave errors (unique constraint and generic) are surfaced through the
indicator's `error` state. The unique constraint case additionally renders an
inline error below the title input (field-specific guidance), but the Sonner
toast originally specified in D12 for generic autosave failures is removed.
Sonner is reserved for non-autosave failures: publish, unpublish, and close.

**Why:** A persistent inline indicator and a disappearing toast are redundant
for the same event. Routing all autosave feedback through one surface is
simpler and more consistent. The "Saved" state persisting (no fade) matches
the Confluence reference and avoids re-reading the indicator to confirm state.
Spinner-only during saving avoids a jarring text swap between "Saving…" and
"Saved".

**Ruled out:** Fading "Saved" after a timeout — the original T7 recommendation;
rejected to match the design reference. "Saving…" text alongside the spinner —
unnecessary; the spinner alone communicates in-progress state. Sonner for
generic autosave errors — superseded by the inline indicator.

---

## D15: `publishedAt` display on the edit page — static, set on load, with time

**Decision:** Render `publishedAt` as a static `<time>` element set once on
page load using the format `"MMMM do, yyyy 'at' h:mm a"` (e.g. `May 3rd,
2026 at 10:30 AM`) via the existing `Time` component. When `publishedAt` is
null (draft), display the current date/time captured at render time. When
`publishedAt` is set (published), display the actual publish date/time. No
live clock.

**Why:** The format matches the post detail page (`"MMMM do, yyyy"`) extended
with time, keeping the two pages visually consistent. A static value set on
load is simpler than a ticking clock and sufficient — the edit page is not
a dashboard where real-time accuracy matters. Including the time distinguishes
posts created on the same date.

**Ruled out:** Live clock updating every minute — unnecessary complexity; the
draft timestamp is a placeholder, not a precision instrument. Date only without
time — loses the ability to distinguish same-day drafts.

---

## D16: Edit page auth guard — server-side RSC redirect + client `useLayoutEffect`

**Decision:** The edit post page route (`app/posts/[id]/edit/page.tsx`) is an
async RSC that calls `authenticateAPISession()` and checks
`hasPermission(token.user, 'posts', 'update')` before rendering. If either
check fails it calls `redirect(ROUTES.home)` server-side. `EditPostForm`
additionally implements `useLayoutEffect` mirroring the existing
`CreatePostForm` pattern as a belt-and-suspenders guard.

**Why:** The server-side redirect prevents any flash of unauthenticated content
— the RSC never renders the client component for unpermitted users. The
`useLayoutEffect` guard matches the existing pattern the constraint doc
explicitly references. Both coexist with no meaningful duplication cost.

**Ruled out:** `useLayoutEffect` only — causes a visible flash before the
redirect fires. Server-side only — departs from the established pattern the
constraint doc describes.

---

## D17: PostPageAdminMenuContent — convert "New Post" to form action, add Edit link

**Decision:** `PostPageAdminMenuContent` gains an "Edit" `<Link
href={ROUTES.editPost(post.id)}>`. The existing "New Post" `<Link
href={ROUTES.newPost}>` is converted to `<form action={createPost}>` matching
the pattern in `PostsPageAdminMenuContent` (per D8). The component ends up
with three actions: New Post (form), Edit (link), Delete (form).

**Why:** Admins frequently navigate to a post detail page and then want to
create a new post — removing "New Post" from this context would add an
unnecessary detour back to the posts list. The link-to-form conversion is
required because `ROUTES.newPost` is removed in PR 4. Edit is a new
requirement for this component.

**Ruled out:** Removing "New Post" from `PostPageAdminMenuContent` — forces
the admin to navigate away just to create a post. Keeping "New Post" as a
link — `ROUTES.newPost` no longer exists after PR 4.

---

## D18: Pagination preserves `unpublished` query param in page links

**Decision:** `FindAndCountPostsDto` adds `unpublished?: string` to its
schema. `getPosts` passes the `unpublished` param through to the DTO. The
`Pagination` component receives an optional `unpublished?: boolean` prop; when
`true`, each page link is built as `${ROUTES.posts}?page=${N}&unpublished=true`
instead of `${ROUTES.posts}?page=${N}`. The posts page passes `unpublished`
down to `Pagination` when the URL param is present.

**Why:** The current pagination component hardcodes `?page=N` with no
mechanism to carry additional params. Without this change, navigating to page
2 while the unpublished filter is active silently drops the filter. Passing
`unpublished` as a prop keeps the link-building logic self-contained and
avoids reading `useSearchParams` inside a server-rendered component.

**Ruled out:** Reading `useSearchParams` inside `Pagination` — couples the
component to the URL shape and complicates testing. A generic `extraParams`
prop — over-engineered; only one extra param is needed here.

---

## D19: Publish button flushes pending autosave before calling `publishPost`

**Decision:** The Publish button is a client-side handler that: (1) cancels
the pending debounce timer, (2) calls `updatePost` with the current field
values, (3) on success calls `publishPost`, (4) on success redirects to
`ROUTES.post(id)`. If `updatePost` fails the error surfaces via the save-state
indicator and `publishPost` is not called. If `publishPost` fails a Sonner
toast is shown (per D14).

A subsequent autosave after a successful publish is safe: `updatePost` updates
only `{ title, description, content }` and does not touch `publishedAt`, so no
autosave can clear the published state.

**Why:** `publishPost` reads from the DB to validate fields — it does not
accept field values directly. A pending 1-second debounce at click time means
`publishPost` would read stale content. Flushing `updatePost` first (the same
pattern as Close in D13) guarantees the DB reflects the current client state
before `publishedAt` is set.

**Ruled out:** Passing field values directly to `publishPost` — gives it two
responsibilities (save + publish). Letting the debounce fire naturally before
publish — introduces a race window. A two-button "save then publish" UX —
unnecessary complexity.

---

## D20: `publishPost` is atomic — saves content fields and sets `publishedAt` together

**Decision:** `PublishPostDto` carries `{ id, publishing: boolean, title: string,
description: string, content: string }`. `PostRepository.publish` performs a
single `prisma.post.update` that writes `title`, `description`, `content`, and
`publishedAt` in one call. `publishedAt` is set to `new Date()` when
`publishing: true`, or `null` when `publishing: false`.

The Publish/Unpublish button handler becomes: (1) cancel the pending debounce,
(2) call `publishPost` with current form state, (3) on success redirect to
`ROUTES.post(id)` (publish) or stay in place (unpublish). No prior `updatePost`
flush is needed.

The field is named `publishing` (present-participle adjective describing the
intended state) rather than `publish` (a verb command).

**Why:** Since `publishPost` carries all content fields itself, there is no need
to flush `updatePost` first — the atomic write guarantees the DB reflects the
current client state and sets `publishedAt` in a single round-trip. The same
concern about clients sending arbitrary values applies equally to `updatePost`,
so there is no additional risk. Eliminating the flush step simplifies the button
handler and removes a sequential async dependency.

**Ruled out:** Separate flush (`updatePost`) then `publishPost` (D19 approach) —
requires two sequential server round-trips and a brittle "flush succeeded" gate.
DB-read approach (service fetches post to validate fields) — an extra read that
provides no additional safety over DTO validation.

**Supersedes:** D19 (the flush-first rationale no longer applies).

---

## D21: New `RichTextEditor` for the edit page; existing component renamed `LegacyRichTextEditor`

- **Decision:** The existing `RichTextEditor` is renamed `LegacyRichTextEditor` in a dedicated PR before the edit page work begins. A new `RichTextEditor` is built specifically for the edit page: no internal `LexicalComposer`, no embedded `ToolbarPlugin`. `EditPostForm` owns the `LexicalComposer` and wraps both `ActionBar` (which renders `ToolbarPlugin`) and the new `RichTextEditor`. `ToolbarPlugin` is re-exported from `globals/components/richTextEditor/index.ts` alongside `RichTextEditor`. The new component becomes the foundation going forward.
- **Why:** Adding an `omitToolbar` branch to the existing component introduces conditional logic that serves only the edit page use case. A purpose-built component is simpler, has no backwards-compatibility surface, and makes the edit page's `LexicalComposer` ownership explicit. The rename keeps existing consumers working without any changes.
- **Alternatives considered:** `omitToolbar` prop on the existing `RichTextEditor` — requires the component to conditionally skip its own `LexicalComposer`, which is confusing and creates an implicit contract that the caller must provide one. Portal-based toolbar rendering — unnecessary indirection when a shared composer achieves the same result cleanly.
- **Step:** Step 3 — refinement (T14)

---

## D22: Migration workflow — `prisma migrate dev --create-only` + hand-edit

- **Decision:** PR 1's migration is created via `prisma migrate dev --create-only`, which generates a timestamped migration directory with the schema-diff SQL (`ALTER COLUMN "content" DROP DEFAULT`). The generated `migration.sql` is then hand-edited to append `CREATE UNIQUE INDEX "Post_title_key" ON "Post" (title) WHERE title != ''`. `prisma migrate dev` is run to apply and record the migration.
- **Why:** This is the canonical Prisma workflow for schema changes that include SQL Prisma's DSL cannot generate. The migration lives in `prisma/migrations/` with a standard timestamped name, is tracked in `_prisma_migrations`, and follows the same ordering and application mechanics as every other migration in the codebase. Describing the migration as "hand-written raw SQL" (D1's original phrasing) was misleading — Prisma generates the scaffold; only the partial index line is hand-authored.
- **Alternatives considered:** Standalone raw SQL file outside `prisma/migrations/` — not tracked by Prisma, easy to mis-order or miss during deployment. Two separate migrations (one generated, one hand-written for the index) — unnecessary split; one logical change belongs in one migration.
- **Resolves:** T15
- **Step:** Step 3 — refinement (T15)

---

## D23: Full `@unique` on `Post.title` — supersedes D1 and D22

- **Decision:** Add `@unique` to `Post.title` in `schema.prisma`. Prisma generates the unique constraint SQL automatically. No hand-authored partial index and no `--create-only` workaround are needed. The migration is fully Prisma-managed.
- **Why:** The partial index (`WHERE title != ''`) was motivated by a design that allowed multiple empty-title drafts. The timestamped placeholder approach (D8) means `createPost` never writes `title = ''`, so the empty-string exclusion serves no purpose. `UpdatePostDto` requires a non-empty title, so blank-title autosaves are rejected before reaching the DB. A full unique constraint is simpler, directly expressible in the Prisma schema, and provides complete integrity coverage.
- **Ruled out:** Partial index — the `WHERE title != ''` exclusion is no longer needed; retaining it would be complexity with no benefit. Application-layer-only uniqueness — risks integrity if the DTO path is bypassed.
- **Supersedes:** D1 (partial index motivation is gone), D22 (`--create-only` workflow no longer needed)
- **Resolves:** T16
- **Step:** Step 3 — refinement (T16)

---

## D24: Rollout resequenced — rename and Dialog install first; /posts/new deletion last; unpublished filter early

- **Decision:** All 12 PRs resequenced. PR 1: `LegacyRichTextEditor` rename (no deps — safe refactor that unblocks edit page work without depending on the migration). PR 2: Shadcn Dialog install (no deps — safe prerequisite). PR 3: DB migration (gates all backend work). PRs 4–5: backend (`updatePost`, `getPosts` unpublished filter). PR 6: `PostsPageAdminMenuContent` unpublished toggle (admin can now see unpublished drafts throughout the entire build). PRs 7–11: full edit page build. PR 12: `createPost` draft redirect + `/posts/new` deletion (last — edit page fully functional before any user-visible removal).
- **Why:** The original sequence removed `/posts/new` at PR 4, leaving no way to create posts during the entire edit page build (PRs 5–11). Moving the rename (T18) and Dialog install to the front gives the edit page build clean, dep-free prerequisites. Moving the unpublished toggle to PR 6 (T20) ensures the admin has visibility into unpublished drafts from the start. Moving `/posts/new` deletion to last ensures it ships only after the replacement flow is proven end-to-end.
- **Alternatives considered:** Feature-flagging `/posts/new` removal — rejected (no feature flags per constraints). Keeping the unpublished filter last — leaves the admin blind to drafts during the entire build; the toggle is low-risk and should land as soon as the backend is ready.
- **Resolves:** T18, T20
- **Step:** Step 3 — Iterative Refinement (T18, T20)

---

## D25: `UpdatePostDto` requires only `id`; `title`, `description`, `content` are optional

- **Decision:** `id` is the only required field in `UpdatePostDto`. It is coerced from form data string to an integer via `coerce.number().int().min(1)`. `title`, `description`, and `content` are `optional().nullable()` with a `transformString` coercion (absent/null → `''`), mirroring the existing `create-post.schema.ts` pattern.
- **Why:** Autosave fires continuously as the admin types — including before any description or rich-text content has been entered. Requiring `description` or `content` on every save would cause autosave to fail the moment a new post is opened. The transform-to-empty-string approach ensures the repository always receives a complete `{ title, description, content }` payload regardless of which fields are present.
- **Alternatives considered:** Requiring `title` in addition to `id` — rejected because autosave should not block when the admin clears the title (the UX handles the no-title state separately via `CloseButton` confirmation). Optional fields without transform — rejected because downstream code (repository, service) expects strings, not `undefined`.
- **Resolves:** T17
- **Step:** Step 3 — Iterative Refinement (T17)
- **Superseded by:** D26

---

## D26: `UpdatePostDto` requires `id` and `title`; supersedes D25

- **Decision:** Both `id` (`coerce.number().int().min(1)`) and `title` (`string().min(1)`) are required in `UpdatePostDto`. `description` and `content` remain optional/nullable with transform to `''`.
- **Why:** The post always has a title — `createPost` writes a timestamped placeholder so the admin can never open an edit page with a blank title field. Requiring `title` ensures the DB is never written with an empty string, which avoids collisions on the `@unique` constraint (D23) and keeps the data model clean. When the admin clears the title, autosave fails validation and the SaveStateIndicator surfaces an error — which is the correct UX signal.
- **Alternatives considered:** Title optional (D25) — rejected because it would allow autosave to write `title: ''`, risking a unique constraint error on a second no-title post and leaving silent empty-title records in the DB.
- **Supersedes:** D25
- **Resolves:** T17 (amended)
- **Step:** Step 3 — Iterative Refinement (T17)

---

## D27: Description modal — manual Save + Cancel (Option A)

- **Decision:** `DescriptionModal` holds temporary local state (`localDescription`) initialised from the description hidden input (`formRef.current`) when the modal opens. The **Save** button calls `updatePost` directly with `{ id, title, description: localDescription, content }`, on success closes the modal. Inline error is shown in the modal on failure. The **Cancel** button discards temp state and closes without saving. Autosave does not fire on modal close.
- **Why:** Cancel-button semantics require that closing without Save truly discards changes. Triggering autosave on close — even 1 second later — conflicts with this. The manual Save pattern gives the modal deterministic save/discard semantics.
- **Alternatives considered:** Option B — flush the debounce with the new description value. Rejected because the modal cannot display an inline error if the flush fails; the failure surface is `AutoSaveStatus`, which is outside the modal and easy to miss.
- **Resolves:** T19
- **Step:** Step 3 — Iterative Refinement (T19)

---

## D28: Dialog split — one directory per sub-component at `globals/components/ui/` level

- **Decision:** Each dialog sub-component (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`) gets its own directory directly under `globals/components/ui/`, matching the flat layout of the pagination family. No parent `dialog/` wrapper directory.
- **Why:** The existing one-component-per-directory convention in `globals/components/ui/` is flat — pagination sub-components (`paginationContent/`, `paginationItem/`, etc.) are all peers at the top level, not nested under a `pagination/` parent. Grouping dialog sub-components under a parent would create an inconsistency with that established pattern.
- **Alternatives considered:** All sub-components under `globals/components/ui/dialog/` with one sub-directory each — rejected because it departs from the flat convention and introduces nesting that no other component family uses.
- **Step:** PR 2 — Implementation

---

## D30: `UpdatePostState` shape — FormData spread, no `id` in state, forbidden redirects home

- **Decision:** `UpdatePostState` carries no `id` field. On success, error, and unique-constraint error, the action spreads `Object.fromEntries(formData)` back into the returned state (same pattern as `CreatePostState`). Forbidden sessions are redirected to `ROUTES.home` (not returned as an error state). Unauthorized sessions are redirected to `ROUTES.loginWithRedirect(ROUTES.post(id))` where `id` is read from the FormData. The unique constraint field is named `threwUniqueConstraintError`.
- **Why:** `id` comes through FormData alongside the other post fields, so there is no reason to also carry it in state — spreading the FormData entries back covers it. The forbidden redirect to home is consistent with `createPost` (both are write actions the user has no business triggering without permission). Reading `id` from FormData for the unauthorized redirect avoids needing state to carry it as a typed field.
- **Alternatives considered:** `id: Post['id']` required in state (initial draft) — rejected; the FormData spread subsumes it and keeping it as a separate typed field would duplicate the value. Returning an error state on forbidden — rejected; matches `createPost` which redirects on forbidden.
- **Step:** PR 4 — Implementation

---

## D29: `Post.content` made nullable — amends D2

- **Decision:** The PR 3 migration drops `NOT NULL` from `Post.content` in addition to dropping `@default("{}")`. `schema.prisma` reflects this as `content Json?`. `createPost` continues to write a valid initial Lexical JSON string via `CreatePostDto`, so the column is never null for newly created posts in practice.
- **Why:** Making the column nullable correctly reflects that a draft's content is genuinely optional — the schema should not pretend otherwise by requiring a value when none exists yet. Keeping `NOT NULL` without a default would leave a footgun: any write path that bypasses `CreatePostDto` would produce a Postgres error rather than a graceful failure. `Json?` documents the column's optional nature at the schema level and is consistent with the constraint doc's warning that the `{}` default "would actually break the RichTextEditor if it ever saved."
- **Alternatives considered:** `NOT NULL` with no default (the implicit D2 approach) — more brittle; a missed DTO path causes a hard Postgres error rather than a schema-safe null. Keeping `@default("{}")` — already ruled out in D2 as a latent footgun.
- **Amends:** D2 — the "Making content nullable — unnecessary schema churn" note in D2's ruled-out section no longer stands; this was part of the original plan and shipped in PR 3.
- **Step:** PR 3 — Implementation

---

## 2026-05-14 - D34: `Switch` variant implementation — revised color tokens; amends D33

- **Decision:** The implemented color tokens deviate from the D33 discovery table. Both `default` and `inverted` tracks use `bg-subtle` in the unchecked state (not a constant per-variant color). Thumb off-states use opacity modifiers for contrast. Final token mapping:

  | Variant | Track (off) | Track (on) | Thumb (off) | Thumb (on) |
  |---------|-------------|------------|-------------|------------|
  | `default` | `bg-subtle` | `bg-background` | `bg-background/70` | `bg-input` |
  | `inverted` | `bg-subtle` | `bg-input` | `bg-input/80` | `bg-background` |
  | `primary` | `bg-input` | `bg-primary` | `bg-background` (all existing dark-mode classes) | ← same |

- **Why:** Visual testing revealed that a static `bg-input` track for `inverted` created insufficient contrast between the unchecked and checked states on the `#d9d9d9` admin menu background. Anchoring both variants at `bg-subtle` for the unchecked track provides a neutral starting point; the on-state track color then distinguishes the variants (`bg-background` for `default`, `bg-input` for `inverted`). Opacity modifiers on the thumb off-state (`/70`, `/80`) reduce its visual weight so the unchecked state reads as clearly inactive.

- **Alternatives considered:** Static per-variant track colors as in D33 — insufficient contrast in the admin menu context. A single opacity value across all thumb states — `/70` and `/80` differ slightly between variants because the source colors differ; a uniform value would over-darken one or under-contrast the other.

- **Amends:** D33 — the "Track" column in D33's table is superseded by this entry. The prop name, cva implementation pattern, and `primary` behavior are unchanged.

- **Step:** PR 5.5 — Implementation

---

## 2026-05-14 - D33: `Switch` three-variant color system — `default`, `inverted`, `primary`

- **Decision:** `Switch` gains a `variant` prop (`'default' | 'inverted' | 'primary'`), consistent with the `Button` component's prop naming. All three variants use a constant-color track (no state-based track color change) except `primary`, which retains the existing teal-on-checked behavior as an opt-in. The thumb color indicates state in `default` and `inverted`.

  | Variant | Track | Thumb (off) | Thumb (on) |
  |---------|-------|-------------|------------|
  | `default` | `bg-subtle` | `bg-background` | `bg-input` |
  | `inverted` | `bg-input` | `bg-subtle` | `bg-background` |
  | `primary` | `bg-input` (off) / `bg-primary` (on) | `bg-background` (all existing behavior) | ← same |

  `default` and `inverted` are true inverses: track and thumb tokens swap symmetrically. `primary` preserves the previous default in full, including dark-mode overrides, for contexts that require a branded checked state.

  `UnpublishedPostsToggle` uses `variant="inverted"` because it renders inside `AdminMenuDialog`, which applies `bg-foreground` (`#d9d9d9`) — the inverse of the site's dark background.

- **Why:** The old default used `bg-primary` (teal) for the checked track. Teal clashed visually with the light `#d9d9d9` admin menu background. The thumb (`bg-background` = `#1b1b1b`) was nearly invisible against the near-white `bg-input` unchecked track in the admin menu context. A proper inverted variant was needed; separating `primary` into its own variant preserves the branded option without making it the global default.

- **Alternatives considered:** CSS-context overrides via `className` — too fragile, requires callers to know internals. A single `invert` boolean — works for two states but can't represent the three distinct color schemes needed. `theme` as the prop name — rejected in favour of `variant` to stay consistent with `Button`. Keeping `primary` as the default — conflicts with the admin menu context where teal is inappropriate.

- **Step:** PR 5.5 — Discovery (implementation deviations documented in D34)

---

## 2026-05-10 - D32: `authorizeUnpublishedPosts` — auth gate outside `'use cache'` boundary; supersedes D7 auth placement

- **Decision:** Auth for the unpublished filter is enforced in a dedicated `'use server'` action, `authorizeUnpublishedPosts`, called by `latestPosts.tsx` before `getPosts` is entered. `getPosts` itself contains no auth logic. No auth backstop exists deeper in the stack — callers are responsible for invoking `authorizeUnpublishedPosts` before entering the cache.
- **Why:** D7 planned to put the auth check in `PostService.findAndCount`. That plan has two compounding problems: (1) the service is called from *within* `getPosts`, which has `'use cache'`, so the service is inside the cache boundary — not before it; (2) Next.js hard-blocks `headers()` inside `'use cache'` at runtime. `getServerSession` calls `headers()` internally, so any call to `authenticateAPISession` from inside the cache throws a runtime error. Auth cannot live anywhere in the `getPosts → PostService → PostRepository` chain. The only viable position is a separate server action invoked by the caller before entering the cache. `authorizeUnpublishedPosts` redirects on unauthorized/forbidden and short-circuits on `unpublished: false`, so there is no auth overhead on public requests.
- **Alternatives considered:** Auth in `PostService.findAndCount` (D7 plan) — impossible; the service is inside `'use cache'`. Auth in `PostRepository.findAndCount` as a backstop — attempted; same constraint applies, `headers()` is blocked inside `'use cache'`, causing a runtime error. Passing the authenticated user as a `getPosts` argument to include it in the cache key — makes every user's posts list a separate cache entry, destroying cache effectiveness for the public (published) path.
- **Supersedes:** D7 in part — the "why not in the cached function" rationale in D7 still holds, but the planned auth location (service layer) was wrong. Auth lives in a pre-cache action, not in the service.
- **Step:** PR 5 — Implementation

---

## 2026-05-08 - D31: Autosave wiring — `useActionState` + inline debounce; `DescriptionModal` owns separate instance

- **Decision:** Replace the underspecified `useAutoSave` custom hook with `useActionState(updatePost, initialState)` in `EditPostForm`. Debounce is inlined via `useRef` + `setTimeout` — no custom hook. FormData is constructed from a `formRef` on the form element. `DescriptionModal` owns its own `useActionState(withCallbacks(updatePost, { onSuccess }), initialState)` instance; `withCallbacks` is used only for the auto-close side effect. All autosave display (spinner, "Saved", error, field errors) is derived directly from `state` and `pending` — no callbacks, no mirrored state. `state.threwUniqueConstraintError` and `state.dtoError.fieldErrors` are read independently by the components that own them.
- **Why:** `startTransition` discards the action return value — the state machine could never observe success or failure. `useActionState` threads state automatically and exposes `pending`. The `useAutoSave` abstraction added no reusable value; debounce is 5 lines inlined. `DescriptionModal` owning a separate instance avoids ref-based "which save was mine" detection. `withCallbacks` in the modal provides a clean `onSuccess` hook for auto-close without coupling the modal's error display to callbacks.
- **Alternatives considered:** Shared `updateAction` dispatch from `EditPostForm` passed to `DescriptionModal` (Option B) — rejected; modal would need a ref flag to distinguish its save from a concurrent autosave. `withCallbacks.onError` for field error state — rejected; `state` already carries `dtoError` and `threwUniqueConstraintError`, mirroring them into separate state variables is redundant.
- **Supersedes:** D4 (custom `useAutoSave` hook)
- **Resolves:** T21
- **Step:** Step 3 — Iterative Refinement (T21)

---

## 2026-05-17 - D35: T25 split into error-handling PR and deferred skeleton PR; missed PR-07 items distributed; T22 absorbed

- **Decision:** T25 is split into two new PRs. PR 14 covers error handling: `notFound()` for missing posts and a `not-found.tsx` at the edit route segment; all other errors keep the existing generic error UI. PR 14 absorbs T22 and requires issue #157 (not-found error type rename) to be resolved first. PR 15 is the loading skeleton, intentionally deferred until after PR 9 so the skeleton matches the final layout. Three items missed in PR 7's implementation are distributed forward: `state.threwUniqueConstraintError` (inline error below title) and `state.dtoError?.fieldErrors?.content` (inline error near editor) move to PR 8; `flushDebounce` (immediate-flush path for Close and Publish) moves to PR 9 where the ActionBar is introduced and first consumes it.
- **Why:** Designing a skeleton before the action bar and toolbar land would require rework in PR 9. Absorbing T22 into PR 14 avoids a standalone one-item PR. The missed PR-07 items belong in PRs 8 and 9 because they are co-located with work already scoped to those PRs: error display is near the title/editor (PR 8 scope) and `flushDebounce` is first needed by the ActionBar (PR 9 scope).
- **Alternatives considered:** Standalone "missed PR-07 items" PR — adds a PR with no clear feature scope. Skeleton before page is built — risks rework when layout changes in PR 9. Separate PR for T22 alone — undersized; absorbed into the error handling PR instead.
- **Resolves:** T22, T25
- **Step:** Step 3 — Iterative Refinement (T22, T25)

---

## 2026-05-17 - D36: No server-side auth redirect on the edit page — proxy + permission guard + EditPostPolicyEnforcer are sufficient

- **Decision:** The edit page (`app/posts/[id]/edit/page.tsx`) does not implement a server-side `redirect()` on unauthenticated requests. Auth is enforced by three layers already in place: the reverse proxy (blocks all anonymous traffic at the network edge), the `updatePost` server action permission check (any autosave attempt without `posts.update` permission is rejected), and `EditPostPolicyEnforcer` (client-side `useLayoutEffect` that redirects to home if the session lacks `posts.update` permission). A fourth server-side redirect in `page.tsx` adds no meaningful security benefit.
- **Why:** The proxy ensures unauthenticated users never reach the page. Any autosave fired without permission is rejected by the action guard. `EditPostPolicyEnforcer` covers client-side navigation without a session. The three-layer defence is equivalent to a server-side RSC redirect for this admin-only route.
- **Alternatives considered:** Server-side `authenticateAPISession()` + `redirect()` in `page.tsx` (original D16 plan) — rejected; redundant given the existing layers, and `page.tsx` is already a sync RSC that doesn't need an async auth call.
- **Supersedes:** D16 (server-side redirect rationale no longer applies)
- **Step:** PR 7 — Implementation

---

## 2026-05-22 - D37: Design map (Figma) review — SaveStateIndicator, CloseButton form, error states design pending

- **Decision:** The following architecture changes are made based on Figma design review (see `inputs/design-map.md`):
  1. `SaveStateIndicator` IDLE state shows `formatDistanceToNow(post.updatedAt, { addSuffix: true })` (e.g. "Edited 3 minutes ago") rather than nothing. After any successful save the indicator switches to "Saved".
  2. `PublishedAtSubtitle` is removed from the page body. The published date information is now surfaced via the `SaveStateIndicator` idle phrase in the `ActionBar`.
  3. The description modal Save button is labeled **"Save changes"** (per Figma), not "Save".
  4. Toolbar RTE controls (Bold, Italic, Underline, Strikethrough, alignment, Block Select) dim when the editor content area is not focused. Description, Publish/Unpublish, and Close buttons are unaffected by focus state.
  5. The `PublishUnpublishButton` disabled state uses the standard `disabled` HTML attribute, which maps to `disabled:opacity-50` already in the Button CVA variants — no extra styling required.
  6. The inline title unique-constraint error renders **above** the title input (not below as stated in D12). D12's "below" language is superseded.
  7. `CloseButton` uses `useActionState(withCallbacks(updatePost, { onSuccess }), initialState)`. Its form includes hidden inputs populated from `formRef.current` (id, title, description, content) plus a `redirectPath` hidden input set to `ROUTES.post(post.id)`. `updatePost` gains a `redirectPath` DTO field; on success the server action redirects to that path. There is no separate flush mechanism.
  8. `DescriptionModal` uses the same hidden-inputs-from-`formRef.current` pattern (without `redirectPath`).
  9. Error display for autosave failures, description modal save failures, publish/unpublish failures, and close failures is **design pending**. Publish success uses Sonner toast (message content design pending) then redirects. Close success redirects to the post page with no toast.
- **Why:** Direct Figma review of screens 1–14 (design-map.md) revealed that the architecture docs predated the finalized designs. D14's "nothing" IDLE state contradicts screen 1 which shows a timestamp phrase. D15's PublishedAtSubtitle contradicts the same screen. D12's error position was wrong. D13's flush concept was replaced by the simpler hidden-inputs form pattern, which makes Close and DescriptionModal consistent with how autosave already works.
- **Resolves:** Design discrepancies found in D12, D14, D15
- **Opens:** T26 (skeleton install + discovery), T27 (EditPostContent wrapper documentation), T28 (revisit once pending designs land)
- **Step:** Step 3 — Iterative Refinement (Figma design review)

---

## 2026-05-22 - D38: Breadcrumbs dropped for `/posts/[id]` and `/posts/[id]/edit`

- **Decision:** Breadcrumbs will not be added to the post page or the edit page. T23 is cancelled.
- **Why:** Decided during design review session on 2026-05-22. The pages do not require breadcrumb navigation for this project.
- **Alternatives considered:** Shadcn Breadcrumb installed and wired to both pages in a single PR (original T23 plan) — dropped.
- **Cancels:** T23
- **Step:** Step 3 — Iterative Refinement

---

## 2026-05-24 - D39: Confirmed design specs from Figma screens 13–25

- **Decision:** The following specs are confirmed from Figma screens 13–25. All "design pending" markers from T28 are resolved.
  1. The action bar save-state component is named **`AutoSaveStatus`** (replaces `SaveStateIndicator` everywhere). Saving state: spinner + "Saving...". Error state: "Updates not saved" in destructive red.
  2. Autosave failure: Sonner toast — "Post could not be saved".
  3. Close button shows **"Closing..."** + spinner while in flight.
  4. Close failure: dialog — **"There are unsaved changes / Are you sure you want to leave?"** — with Cancel (stay on page) and Close (destructive; a `<Link href={ROUTES.post(post.id)}>` that navigates away without saving). Replaces D13's no-title delete confirmation and the Sonner-on-failure approach from prior PR-10 spec.
  5. Publish button shows **"Publishing..."** + spinner (teal) while in flight.
  6. Publish failure: Sonner toast — "Post could not be published".
  7. Unpublish failure: Sonner toast — "Post could not be unpublished".
  8. Publish success: Sonner toast — "Success!" — appears on the post page after redirect. Unpublish success: Sonner toast — "Success!" — label toggles in-place; no redirect.
  9. Description modal saving: "Save changes" button shows an inline spinner while in flight.
  10. Description modal generic save failure: "Something went wrong" in red below the "Description" label.
  11. Description modal Zod errors: bullet list in red below the "Description" label.
  12. Description modal with empty description: Save changes button is **disabled**.
  13. `DescriptionButton` is **disabled** when `AutoSaveStatus` is in error state. Because the modal cannot be opened during an autosave error, the unique-constraint failure case is unreachable in the description modal — only Zod and generic failures apply.
- **Why:** Figma screens 13–25 were added to the design map, covering all previously pending error, loading, and success states. Design review session on 2026-05-24 confirmed each spec against the live designs.
- **Alternatives considered:** None — these are direct design confirmations, not architectural choices.
- **Supersedes:** D13 (no-title delete confirmation flow)
- **Resolves:** T28
- **Step:** Step 3 — Iterative Refinement

---

## 2026-05-25 - D40: `togglePostPublishedStatus` — action design, DTO reuse, toggle contract

- **Decision:** The publish/unpublish server action is named `togglePostPublishedStatus` (not `publishPost`). It reuses `UpdatePostDto` — no separate `PublishPostDto` or `publish-post.schema.ts`. `UpdatePostDto` will gain two optional fields as part of the global plan: `publishedAt` (the post's current DB value, sent as a hidden input from the form to avoid a DB lookup) and `redirectUrl` (the post detail page URL, sent only on the publish path). The toggle direction is determined by `dto.params.publishedAt`: truthy → unpublish (set `null`); falsy → publish (set `new Date()`). The repository performs one atomic `prisma.post.update` writing all content fields and `publishedAt` together. On publish success the action calls `redirect(dto.params.redirectUrl)`; on unpublish success it returns `{ ...params, status: 'SUCCESS' }`. Error handling mirrors `updatePost` exactly — same branch structure including `unique-constraint` returning `threwUniqueConstraintError: true`. Lexical content safety validation is inherited from `UpdatePostDto` at no extra cost.
- **Why:** Using `UpdatePostDto` keeps the backend consistent — one DTO, one schema, one validation path. Sending `publishedAt` as a hidden input (the edit page already has the post) avoids an extra DB read. Sending `redirectUrl` in the form rather than constructing it in the action keeps routing concerns in the component. Mirroring `updatePost` error branches avoids inventing new patterns.
- **Alternatives considered:** Separate `PublishPostDto` with a `publishing: boolean` flag — unnecessary new file when `UpdatePostDto` covers the same shape. Reading `publishedAt` from the DB in the service — an avoidable round-trip when the form already has the value. Using `redirectUrl` presence as the toggle signal — fragile coupling between routing and business logic.
- **Supersedes:** D19 (flush-first was superseded by D20; now D20's `publishPost` naming and separate DTO are also superseded)
- **Resolves:** PR-11 backend discovery (see `jira/pr-11.md`)
- **Step:** Step 3 — Iterative Refinement

---

## 2026-05-25 - D41: PR-11 split into backend (EDIT-POST-11) and frontend (EDIT-POST-17)

- **Decision:** EDIT-POST-11 retains the backend scope only: `UpdatePostDto` extensions (`publishedAt`, `redirectUrl`), `togglePostPublishedStatus` action, `PostService.togglePublishedStatus`, and `PostRepository.togglePublishedStatus`. A new ticket, EDIT-POST-17, covers the frontend: `PublishUnpublishButton` component and its integration into `ActionBar`. EDIT-POST-17 depends on EDIT-POST-11 and EDIT-POST-9.
- **Why:** Backend and frontend are independent work units with no shared state or sequential code dependency within the same PR. Splitting them keeps each PR reviewable in isolation and allows the backend to merge independently of frontend progress.
- **Alternatives considered:** Keep as one PR — original plan; rejected because mixing backend service/repository/DTO changes with frontend component work inflates the diff and couples review of different concerns.
- **Resolves:** T31
- **Step:** Step 3 — Iterative Refinement

---

## 2026-05-25 - D42: `PublishUnpublishButton` is never disabled — supersedes D39 point 5

- **Decision:** `PublishUnpublishButton` has no disabled state. The button is always enabled regardless of title, description, or content values.
- **Why:** Design change confirmed after D39. The disabled-state behavior described in D39 (point 5) was a design artifact that has since been removed.
- **Alternatives considered:** Disable when any field is empty (D39 point 5 plan) — superseded by this decision.
- **Supersedes:** D39 point 5 (disabled state + styling)
- **Step:** Step 3 — Iterative Refinement

---

## 2026-05-25 - D43: `TitleInput` auto-focus removed

- **Decision:** `TitleInput` does not auto-focus on mount.
- **Why:** Owner decision — auto-focus is no longer desired behavior.
- **Alternatives considered:** Auto-focus on mount (original plan) — removed at owner request.
- **Step:** Step 3 — Iterative Refinement (T30)

---

## 2026-05-27 - D44: `redirectPath` standardized — `redirectUrl` in D40 and PR-11 corrected

- **Decision:** The optional redirect field added to `UpdatePostDto` and `updatePostSchema` is named `redirectPath` throughout — in the DTO, schema, server action, and all Jira tickets. D40 and the original PR-11 draft used `redirectUrl`; that name is superseded.
- **Why:** D37 (CloseButton design) already established `redirectPath` as the canonical name. Standardizing on one name avoids a DTO with two redirect-like fields and removes an inconsistency between the two Jira tickets that touch `UpdatePostDto`.
- **Alternatives considered:** `redirectUrl` (D40's name) — rejected in favour of the already-established `redirectPath` from D37.
- **Supersedes:** D40 (the `redirectUrl` field name only — the rest of D40's contract is unchanged)
- **Step:** Step 3 — Iterative Refinement (T30)

---

## 2026-05-27 - D45: T32 resolved — `DescriptionModal` `onSuccess` syncs `formRef` description input

- **Decision:** After `DescriptionModal` saves successfully, `withCallbacks.onSuccess` updates the main form's description hidden input before closing the modal:
  ```ts
  onSuccess: () => {
    const input = formRef.current?.elements.namedItem('description') as HTMLInputElement | null
    if (input) input.value = localDescription
    closeModal()
  }
  ```
  This ensures the next autosave debounce reads the freshly-saved description from `formRef.current` rather than the stale pre-modal value.
- **Why:** `EditPostForm`'s autosave debounce constructs its `FormData` from `formRef.current`. Without this sync, a successful modal save updates the DB but leaves `formRef` stale — the next autosave silently overwrites the saved description. The imperative DOM update is consistent with the existing pattern: `CloseButton` and `DescriptionModal` already read field values from `formRef.current` via the same `elements.namedItem` API. No new state, no re-renders.
- **Alternatives considered:** Lifting `description` to controlled React state in `EditPostForm` — adds a state variable for one field while leaving title and content uncontrolled, creating an inconsistency without a clear payoff. A separate `descriptionRef` passed from `EditPostForm` — more indirection with no benefit over querying `formRef.current.elements` directly.
- **Resolves:** T32
- **Step:** Step 3 — Iterative Refinement (T32)

---

## 2026-05-27 - D46: PR-12 scope narrowed — `createPost` redirect and "New Post" form conversion only

- **Decision:** PR-12 covers two changes only: (1) `createPost` redirects to `ROUTES.editPost(post.id)` instead of the post detail page; (2) the "New Post" button in `PostPageAdminMenuContent` is converted from `<Link href={ROUTES.newPost}>` to `<form action={createPost}>`. The Edit link in `PostPageAdminMenuContent` was already implemented in an earlier PR and is not part of PR-12's scope.
- **Why:** Owner decision during T30 ticket refinement. The Edit link no longer needed to ship as part of this PR since it was already live.
- **Alternatives considered:** Original three-change bundle (D8, D17, D24 plan — `createPost` redirect + `/posts/new` deletion + Edit link) — narrowed because the Edit link was already in place.
- **Supersedes:** D8 in part (the `/posts/new` deletion and Edit link scoping no longer applies to PR-12), D24 in part (the "PR 12: `createPost` draft redirect + `/posts/new` deletion" description is superseded)
- **Resolves:** T30
- **Step:** Step 3 — Iterative Refinement (T30)

---

## 2026-05-27 - D47: `SiteNavbar` rendered opt-in at the call site; `ClientSiteNavbar` and `usePathname` removed

- **Decision:** `SiteNavbar` is removed from the root `app/layout.tsx`. Pages and layouts that need the navbar render it directly and pass `pathname` as a server-side prop — no client hook. `ClientSiteNavbar` is deleted. The `usePathname` dependency is gone.
- **Why:** The previous model was opt-out: every new route that should not show the navbar required the exclusion list in `ClientSiteNavbar` to be updated. That list gets buried and forgotten as the route tree grows. Opt-in rendering is the correct default — each layout/page that wants the navbar declares it explicitly, and pages that don't simply don't render it. No conditionals, no hidden maintenance surface.
- **Alternatives considered:** Extending `ClientSiteNavbar` with per-path conditionals — rejected; this is exactly the buried-list problem. Route group layouts that override the root header — viable but adds file restructuring for the same result.
- **Resolves:** T24
- **Step:** Step 3 — Iterative Refinement (T24)

---

## 2026-05-27 - D48: PR ordering is not maintained — new PRs append to the end of the list

- **Decision:** PRs are added to the end of the PR checklist as they are discovered. The list order does not reflect implementation sequence. Sequence information (dependencies, blocks) lives in the individual Jira ticket files.
- **Why:** Maintaining strict positional order in the checklist requires renumbering or reordering entries every time scope changes, which is error-prone busywork. Dependency information already exists in each ticket's `dependencies` and `blocks` frontmatter — that is the authoritative source for sequencing. The checklist is a status tracker, not a sequenced plan.
- **Alternatives considered:** Strict positional ordering (prior approach) — rejected; creates ongoing maintenance burden and causes confusion when tickets are split or added mid-project.
- **Step:** Step 3 — Iterative Refinement

---

## 2026-05-27 - D49: Design-map screen references live in each Jira ticket, not in a central mapping table

- **Decision:** Each Jira ticket that has corresponding Figma designs contains a `## Design References` table linking to the specific design-map screens relevant to that ticket. No central mapping table is maintained.
- **Why:** A central table in `todos.md` is a duplicate maintenance surface — every time a ticket is added, split, or renamed, the table must also be updated. Putting the references directly in each ticket eliminates that surface: the ticket is the single source of truth for its own design context, and implementors find the links exactly where they need them.
- **Alternatives considered:** Central mapping table in `todos.md` (prior approach, T29) — rejected; maintenance cost with no gain over per-ticket references.
- **Resolves:** T29
- **Step:** Step 3 — Iterative Refinement (T29)

---

## 2026-05-27 - D50: `errorType` return shape — raw error objects replaced in all actions (PR #180)

- **Decision:** All read actions (`getPost`, `getPostsCache`) and write actions (`createPost`, `updatePost`, `deletePost`) now return `errorType: ActionError | 'unhandled' | null` instead of leaking raw error objects to callers. `PostService.respondWithNotFoundError` emits `type: 'not-found'` (previously `'entity'`). `PostService.respondWithPrismaError` additionally checks `error.status === NOT_FOUND` and emits `'not-found'` for that path, keeping `'entity'` for all other Prisma errors. A global ambient type `ActionError` (`types/action-error.d.ts`) enumerates all valid error type strings. Read actions return `{ errorType, status }` alongside their data payload; write actions expose `errorType` on their `ActionState`.
- **Why:** The old shape (`{ error, post }`) leaked internal service error objects to UI components, requiring callers to inspect `error.type` directly. The new shape surfaces only what the UI needs — the error category and HTTP status — without exposing service internals. Separating `'not-found'` from `'entity'` gives `EditPostContent` a clean signal to call `notFound()` (PR-14) vs. render the generic error UI for all other errors.
- **Alternatives considered:** Keeping `{ error, post }` and having PR-14 inspect `error.type` — workable but exposes service types to the component layer and is inconsistent with the `ActionState` pattern on write actions. An `isNotFound: boolean` flag — less general; every new error kind would need a new boolean field.
- **Resolves:** Issue #157 (prerequisite for EDIT-POST-14)
- **Step:** PR #180 — Implementation

---

## 2026-05-29 - D51: Per-post cache tags + `updateTag`-and-redirect on terminal actions; autosave invalidates its own post tag

- **Decision:**
  - `CACHE_TAGS.post` becomes a per-id function `(id) => `/posts/${id}` (was the shared string `'post'`). `getPost` tags with `cacheTag(CACHE_TAGS.post(id))`.
  - `updatePost` is renamed `autosavePost`. On success it calls `updateTag(CACHE_TAGS.post(id))` — invalidating **only its own per-post tag**, not the `posts` list tag — then returns state. The client debounce util is renamed `autosavePost` → `debounceAutosave`.
  - Every **terminal** write action uses Next 16's read-your-writes primitive `updateTag(...)` (replacing the prior `revalidateTag(tag, {})` calls) immediately followed by `redirect(...)`:
    - `createPost` → `updateTag(CACHE_TAGS.posts)` + `redirect(ROUTES.post(id))`
    - `deletePost` → `updateTag(CACHE_TAGS.posts)` + `updateTag(CACHE_TAGS.post(id))` + `redirect(ROUTES.posts)`
    - Publish/Close (PR-17/PR-19) → `updateTag(...)` + `redirect(ROUTES.post(id))`
  - No `experimental.staleTimes` change, no `router.refresh()`, no `revalidatePath`.
- **Why:** Investigation of the "stale `/posts/[id]` after editing" symptom showed the staleness is the **client-side Router Cache**, not the server `'use cache'` data cache. Server-side tag invalidation (`updateTag` / `revalidateTag` / `revalidatePath`) correctly expires `getPost`'s server entry, but none of them evict the *sibling* `/posts/[id]` Router Cache entry that Next serves on a `<Link>` navigation (default `staleTimes.static` = 5 minutes) with no server round-trip. The only mechanism that reliably renders fresh detail content on arrival is a server-action `redirect()` — Next's documented read-your-writes pattern (`updateTag` + `redirect`). Fresh *navigation* to the detail page is only needed at the terminal moments (create, publish, close, delete), all of which already redirect. Autosave keeps the authoritative state in the form via `useActionState`, and invalidates only its own per-post tag (`updateTag(CACHE_TAGS.post(id))`) so that a hard refresh of the edit page — or the eventual terminal-action redirect — renders the latest saved content from the server. It deliberately leaves the `posts` list tag alone: the list is refreshed by the terminal actions (create/delete, publish/close), not on every keystroke debounce. The per-id `post` tag finally realizes D11's stated intent (editing post A evicts only A's detail cache); the old shared `'post'` string evicted every post's detail cache on any write.
- **Alternatives considered:** `experimental.staleTimes { static: 0, dynamic: 0 }` — rejected; disables the client Router Cache app-wide to fix flows the terminal-action redirects already handle. `router.refresh()` on the post page or after autosave — rejected; refreshes the current route only, can't target the sibling route, and adds a client effect for no real-world gain. Keeping autosave-time `revalidateTag(tag, { expire: 0 })` + `revalidatePath` — rejected; both aim at the server cache, which was never the stale layer for navigation. `updateTag` is preferred over `revalidateTag` for terminal Server Actions because it is the read-your-writes primitive — the next request waits for fresh data, rather than `revalidateTag`'s stale-while-revalidate (`profile="max"`) semantics.
- **Supersedes:** D11 (the shared `'post'` tag and the `updatePost`/`deletePost` revalidate contracts — autosave invalidates only its own per-post tag via `updateTag(CACHE_TAGS.post(id))`, `createPost` uses `updateTag(CACHE_TAGS.posts)`, `deletePost` invalidates both `updateTag(CACHE_TAGS.posts)` and `updateTag(CACHE_TAGS.post(id))` to evict the deleted post's detail cache, and `post` is a per-id tag).
- **Resolves:** EDIT-POST-13 (reframed — the ticket's "fresh after autosave" premise is replaced by "fresh on terminal-action redirect").
- **Step:** Step 3 — Iterative Refinement (Issue #179 / EDIT-POST-13)
