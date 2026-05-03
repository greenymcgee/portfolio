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
