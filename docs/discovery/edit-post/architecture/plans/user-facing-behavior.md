# User-Facing Behavior — edit-post

_Source: [`../architecture.md`](../architecture.md) § User-Facing Behavior_

## Personas

| Persona | Role | Key Actions | Auth Context |
|---------|------|-------------|-------------|
| Admin | Authenticated admin | Creates, edits, publishes, and unpublishes posts | NextAuth.js v4 session; `posts.create`, `posts.update`, `posts.publish` permissions |
| User | Anonymous | Views published posts | None |

## User Flows

### Flow 1: Creating a Post (Admin)

1. Admin opens the AdminMenuDialog on the posts page.
2. Admin clicks "New Post" — `createPost` fires as a form action.
3. `createPost` creates a minimal draft (timestamped placeholder title, empty
   Lexical state, empty description) and redirects to `/posts/[id]/edit`.
4. Admin arrives on the edit page with the title input auto-focused.
5. Admin fills in title, description (via Description modal), and content.
6. Autosave fires 1 second after each change.
7. Admin clicks "Publish" — pending debounce is cancelled; `publishPost` fires
   with current form state.
8. Admin is redirected to the post detail page (`/posts/[id]`).

### Flow 2: Editing a Post Title (Admin)

1. Admin opens the AdminMenuDialog on the post detail page.
2. Admin clicks "Edit" — navigates to `/posts/[id]/edit`.
3. Admin types in the auto-focused title input.
4. Autosave fires 1 second after the last keystroke.
5. Admin clicks "Close" — pending debounce is cancelled, `updatePost` flushes.
6. Admin is redirected to the post detail page.

### Flow 3: Editing a Post Description (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button.
2. Admin clicks "Description" in the action bar — the Description modal opens.
3. Admin types in the textarea.
4. Admin closes the modal — description state is held in `EditPostClient`.
5. Autosave fires 1 second after the modal closes (description changed).
6. Admin clicks "Close" — `updatePost` flushes, redirect to post detail page.

### Flow 4: Editing Post Content (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button.
2. Admin clicks in the rich-text editor area.
3. Admin uses the heading dropdown in the action bar to select h2, types a heading.
4. Admin presses enter, types a paragraph.
5. Autosave fires 1 second after the last change.
6. Admin clicks "Close" — `updatePost` flushes, redirect to post detail page.

### Flow 5: Publishing a Post (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button.
2. Admin fills out title, description, and content (all required for publish).
3. Admin clicks "Publish" — button is enabled only when all three fields are non-empty.
4. Pending debounce is cancelled; `publishPost` fires with current form state.
5. Admin is redirected to the post detail page showing the published date.

### Flow 6: Unpublishing a Post (Admin)

1. Admin navigates to `/posts/[id]/edit` via the Edit button on a published post.
2. Admin clicks "Unpublish".
3. `publishPost({ id, publishing: false, ...currentFormState })` fires —
   `publishedAt` is set to `null`; content fields are saved but content
   validation is skipped.
4. Admin stays on the edit page; the button label toggles to "Publish". No redirect.

### Flow 7: Viewing Unpublished Posts (Admin)

1. Admin opens the AdminMenuDialog on the posts page.
2. Admin clicks the "Unpublished" toggle — router pushes `?unpublished=true`.
3. `getPosts` re-runs with `{ unpublished: 'true' }` — `PostService.findAndCount`
   checks the admin permission before including draft posts.
4. Admin sees the list of unpublished posts and can click through to any.

### Flow 8: Duplicate Title Conflict (Admin)

1. Admin navigates to `/posts/[id]/edit`.
2. Admin types a title that already exists on another post.
3. Autosave fires — `updatePost` returns a unique-constraint error.
4. The save-state indicator shows an error; an inline error appears below the title input.
5. Admin changes the title — autosave fires again.
6. Error clears; save-state indicator shows "Saved".

## Scope Boundaries

**In scope:**
- New edit post page at `/posts/[id]/edit`
- `createPost` updated to create a minimal draft and redirect to the edit page
- `updatePost` server action (autosave)
- `publishPost` server action (publish/unpublish)
- Sticky action bar with toolbar, Description button, Publish/Unpublish, Close
- Shadcn Dialog component (used for Description modal and no-title confirmation)
- Admin-only `?unpublished=true` filter on the posts page
- `getPost` cached with `CACHE_TAGS.post`
- Edit button added to `PostPageAdminMenuContent`
- "New Post" converted from `<Link>` to `<form action={createPost}>` in both admin menu components

**Out of scope:**
- The delete flow (already implemented)
- Any changes to how anonymous users see posts
- Multi-author or collaborative editing

## Edge Cases & Error States

| Scenario | Expected Behavior |
|----------|------------------|
| Admin closes the browser / navigates away without typing a title | The timestamped placeholder draft persists. It is findable via the unpublished filter and deletable via the existing delete flow. |
| Autosave fails — unique constraint violation | Save-state indicator shows error; inline error message appears below the title input. |
| Autosave fails — generic error | Save-state indicator shows error text. No Sonner toast for autosave failures. |
| Publish fails — generic error | Sonner toast shown. Admin remains on the edit page. |
| Unpublish fails — generic error | Sonner toast shown. Button label does not toggle. |
| Close fails — generic error | Sonner toast shown. Admin remains on the edit page. |
| Close clicked with no title | Pending debounce cancelled; `updatePost` attempted; on failure with no title, delete confirmation dialog is shown. |
| Autosave and Publish fire simultaneously | Publish cancels the debounce and calls `publishPost` with current form state — no prior `updatePost` flush needed. `updatePost` never touches `publishedAt` so subsequent autosaves are safe. (→ D20) |
| Publish button clicked with empty title, description, or content | Button is disabled client-side; `publishPost` validates server-side as a second gate. |
| Admin arrives at the edit page without a valid session | Server-side RSC redirect to home before the client component renders. `useLayoutEffect` guard fires as belt-and-suspenders. |
