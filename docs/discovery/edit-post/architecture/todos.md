# Todos — edit-post

> Open items that must be resolved before or during implementation.
> Mark resolved items with the decision reference (e.g., → D3).

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

**Status:** Open

Both `updatePost` and `publishPost` modify a `Post` record. Determine
which cache tags they should revalidate:
- `revalidateTag('posts')` — invalidates the paginated posts list
- Does the individual post detail page (`/posts/[id]`) participate in
  any cache? Currently `PostPageContent` calls `getPost` which is marked
  `'use server'`, not `'use cache'`. If it has no cache tag, no
  revalidation is needed for the detail page.
- Confirm during PR 2 implementation whether `getPost` needs a cache tag
  added, or whether the server-component render is sufficient.

---

## T5: Autosave error UX details

**Status:** Open

The requirements call for an error message on unique-title conflict and a
generic error on other autosave failures. Decide the exact display
mechanism before PR 5:
- Options: `sonner` toast (consistent with `deletePost` error), or an
  inline error below the title input (closer to the field).
- Recommendation: inline error below the title for the unique constraint
  case (user needs to fix the field), toast for generic failures (not
  field-specific).
- Confirm this decision before implementing `useAutoSave`.

---

## T6: Close button behavior when autosave is in-flight

**Status:** Open

If the admin clicks "Close" while an autosave `setTimeout` is pending or
a `updatePost` transition is in progress, what happens?
- Option A: flush the pending save before redirecting (call `updatePost`
  synchronously on close).
- Option B: redirect immediately — the most recent saved state is the
  final state; the pending debounced change is lost.
- Recommendation: Option A — explicitly save on close to prevent data
  loss. The Close button triggers `updatePost` then redirects on success.
  If `updatePost` fails and there is no title, show the delete confirmation
  instead.
- Confirm before implementing PR 9.

---

## T7: "Saved" status indicator

**Status:** Open

The design reference shows "Saved" text in the action bar. Decide the
states and transitions:
- `idle` → no indicator (or "Saved" persists from last save)
- `saving` → "Saving..." with spinner
- `saved` → "Saved" for ~3 seconds, then fades
- `error` → "Save failed" (inline, near the indicator)
- Confirm exact timing/UX before PR 5.

---

## T8: publishedAt display on edit page

**Status:** Open

The requirements say publishedAt is "auto-populated to the current date
and time, unless the 'Publish' form has been clicked and a publishedAt
exists for the post." This means:
- Draft (publishedAt is null): show current date/time, update in real-time
  as a read-only `<time>` element
- Published (publishedAt is set): show the actual publish date/time
- Decide whether the live clock updates every minute or is static (set
  on page load).
- Recommendation: static display set on page load, formatted as
  `MMMM do, yyyy` to match the post detail page.

---

## T9: Edit page auth guard implementation

**Status:** Open

The constraint says "The edit post page has middleware protection and a
useLayoutEffect that redirects just like the new post page currently
implements." Decide how to implement this:
- Option A: `useLayoutEffect` in the `EditPostClient` component (mirrors
  `CreatePostForm` today).
- Option B: The page route (`app/posts/[id]/edit/page.tsx`) is an async
  RSC that calls `authenticateAPISession()` directly and redirects server-
  side — faster and avoids the flash of unauthenticated content.
- These are not mutually exclusive; the constraint may intend both.
- Recommendation: server-side redirect in the async RSC (no flash), plus
  `useLayoutEffect` in the client component as a belt-and-suspenders guard
  matching existing patterns.
- Confirm before implementing PR 5.

---

## T10: PostPageAdminMenuContent "New Post" button

**Status:** Open

Currently `PostPageAdminMenuContent` has a "New Post" `<Link href={ROUTES.newPost}>`.
After PR 4, `ROUTES.newPost` is removed. Decide whether:
- The "New Post" form/button is added to `PostPageAdminMenuContent` in
  PR 4 (alongside the existing delete form), or
- The component is left with only Delete + Edit and "New Post" is admin-
  menu-dialog-level behavior only (in `PostsPageAdminMenuContent`).
- The requirements say "PostPageAdminMenuContent includes an edit button"
  but don't mention "New Post" staying there. Confirm scope before PR 4.

---

## T12: Autosave / Publish race condition

**Status:** Open — flagged in requirements.md Edge Cases table

If the admin clicks Publish while a 1-second debounce is still pending,
the publish request may not include the latest typed content. Possible
outcomes:
- The published post has stale content (autosave fires after publish,
  re-saving the latest content but without `publishedAt` being set
  from the autosave path).
- The publish request itself saves the latest client state, making
  autosave's subsequent call a no-op or a conflict.

Resolve the intended behavior and the implementation strategy before PR 9
(Close / Publish buttons). Questions to answer:
- Should the Publish button flush the pending autosave before publishing?
- Should autosave be cancelled when Publish is in-flight?
- Is there a risk of `publishedAt` being cleared by a subsequent
  autosave that doesn't include it?

---

## T11: Unpublished filter and pagination interaction

**Status:** Open

When the `?unpublished=true` filter is active, pagination still uses
`?page=N`. The URL would be `?page=1&unpublished=true`. Confirm that:
- `FindAndCountPostsDto` accepts both params simultaneously.
- `getPosts` passes both through to the DTO.
- The pagination component (`features/posts/components/pagination/`) links
  include `unpublished=true` when the filter is active (not just `?page=N`).
- Resolve during PR 11 planning.
