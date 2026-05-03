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
check fails it calls `redirect(ROUTES.home)` server-side. `EditPostClient`
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

- **Decision:** The existing `RichTextEditor` is renamed `LegacyRichTextEditor` in a dedicated PR before the edit page work begins. A new `RichTextEditor` is built specifically for the edit page: no internal `LexicalComposer`, no embedded `ToolbarPlugin`. `EditPostClient` owns the `LexicalComposer` and wraps both `ActionBar` (which renders `ToolbarPlugin`) and the new `RichTextEditor`. `ToolbarPlugin` is re-exported from `globals/components/richTextEditor/index.ts` alongside `RichTextEditor`. The new component becomes the foundation going forward.
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
