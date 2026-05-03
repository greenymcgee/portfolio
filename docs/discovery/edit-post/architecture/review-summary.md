# edit-post — Engineering Review Summary

_Prepared for engineering review. Summarizes key decisions, open questions, and
risk areas. See [`decisions.md`](./decisions.md) for full rationale on every
decision referenced here._

## Architecture Summary

### What We're Building

Replacing the `/posts/new` form page with a Confluence-style inline editor at
`/posts/[id]/edit`. Clicking "New Post" immediately creates a minimal draft and
redirects the admin to the editor — no intermediate form. The editor autosaves
1 second after the last change. A sticky action bar houses rich-text controls, a
Description modal, a Publish/Unpublish toggle, and a Close button. On the
backend, `updatePost` handles autosave and `publishPost` handles publish state.
The `getPosts` read path gains an admin-only `?unpublished=true` filter. The
`Post` table gets one fully Prisma-managed migration: a `@unique` constraint on
`Post.title`, and the `content` column drops its `{}` default.

### How It Fits Into the Existing System

- Follows the existing **Action → DTO → Service → Repository → `Result`** pattern.
- `getPost` gains `'use cache'` + `cacheTag(CACHE_TAGS.post)`, adding a new
  dedicated cache tag alongside the existing `CACHE_TAGS.posts`.
- The existing `RichTextEditor` is renamed `LegacyRichTextEditor` (PR 5) before
  any edit page work begins; existing consumers are untouched.
- Ships in 12 PRs. PRs 1–3 are backend-only with no user-visible changes. PR 4
  is the only PR that removes user-visible functionality (`/posts/new`).

---

## Key Architectural Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| **Full `@unique` on `Post.title` in `schema.prisma`** (D23) | `createPost` uses a timestamped placeholder so no draft is ever created with `title = ''`. `UpdatePostDto` requires a non-empty title, so blank-title autosaves fail DTO validation before reaching the DB. A full constraint is simpler and fully Prisma-managed. | Partial index (`WHERE title != ''`) — exclusion no longer needed; unnecessary complexity. Application-layer-only enforcement — data integrity risk if DTO path is bypassed. |
| **Two server actions: `updatePost` (autosave) and `publishPost` (atomic)** (D3, D20) | Single responsibility per action. `publishPost` carries all content fields and sets `publishedAt` in one DB write — no sequential flush needed. `updatePost` never touches `publishedAt`. | Single `updatePost` with `publishedAt` field — ambiguous; can't distinguish autosave from publish intent without an extra flag. |
| **Single `LexicalComposer` owned by `EditPostClient`** (D5, D21) | `ToolbarPlugin` uses `useLexicalComposerContext()` and must be a descendant of the same composer as the editor. Wrapping both the action bar and the editor in one composer is the only clean approach. | Portal-based toolbar rendering — unnecessary indirection. Keeping toolbar inside `RichTextEditor` — breaks when editor is not a descendant. |
| **New `RichTextEditor` purpose-built for the edit page; existing renamed `LegacyRichTextEditor`** (D21) | New component has no internal `LexicalComposer` and no embedded `ToolbarPlugin`. `EditPostClient` owns the composer explicitly. No conditional logic in the existing component. | `omitToolbar` prop on the existing component — implicit contract that the caller must provide a composer; confusing interface. |
| **`publishPost` atomic — carries all content fields** (D20) | Single DB round-trip sets `publishedAt` and content fields together. Eliminates the flush-then-publish sequential dependency from the earlier design. | Flush `updatePost` first, then `publishPost` — two sequential round-trips; brittle "flush succeeded" gate. |
| **Permission check for `unpublished` flag in `PostService.findAndCount`, not in `getPosts`** (D7) | `getPosts` is wrapped in `'use cache'` — auth logic must not cross the cache boundary; the cached function runs with no session context. | Permission check in the cached function — auth depends on request context which is not part of the cache key. |
| **Save-state indicator handles all autosave feedback; Sonner only for publish/unpublish/close** (D14) | Routing all autosave feedback through one surface avoids a redundant toast + indicator for the same event. | Sonner for generic autosave errors — superseded; the inline indicator is the single source of truth for autosave state. |
| **Auth guard: RSC redirect + `useLayoutEffect` belt-and-suspenders** (D16) | Server-side redirect prevents any flash of unauthenticated content. `useLayoutEffect` guard matches the existing `CreatePostForm` pattern and covers client-side session expiry. | `useLayoutEffect` only — visible flash before redirect fires. |

---

## Open Questions Requiring Senior Input

None — all risks and open questions were resolved during Step 3 refinement.
See [`risks-open-questions.md`](./plans/risks-open-questions.md) for the full
resolution log.

---

## Risk Areas

All risks were resolved during discovery. The table below records what was
identified and how each was mitigated, for reviewer awareness.

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `ToolbarPlugin` in the action bar requires `LexicalComposer` to wrap both areas | Medium | `EditPostClient` owns the `LexicalComposer`. New `RichTextEditor` has no internal composer. (D5, D21) |
| ~~Partial unique index not expressible in Prisma schema DSL~~ | — | Resolved → D23. Full `@unique` on `Post.title` in `schema.prisma`; migration is fully Prisma-managed. |
| `createPost` relied on `@default("{}")` at the DB level | Low | `CreatePostDto` generates the initial Lexical state. Migration drops the default in PR 1. (D2) |
| `getPosts` cache + unpublished filter could bypass auth | Low | Permission check in `PostService.findAndCount`, outside the `'use cache'` boundary. (D7) |
| Autosave / Publish race condition | Low | `publishPost` is atomic and carries current form state. `updatePost` never touches `publishedAt`. (D20) |

---

## Areas Needing Scrutiny

- **`LexicalComposer` ownership in `EditPostClient`.** The single-composer
  strategy (D5, D21) is the highest-complexity frontend change. Reviewers should
  verify that `ToolbarPlugin` is a true descendant of the `LexicalComposer` owned
  by `EditPostClient`, and that the new `RichTextEditor` correctly omits its own
  internal composer without breaking existing toolbar behaviour.

- **Autosave state machine and flush sequence.** The Close and Publish handlers
  both cancel the debounce and call a server action synchronously. Reviewers
  should check that `useAutoSave` exposes stable `cancel` and `flush` handles,
  and that the four save-state transitions (`idle → saving → saved/error`) are
  exhaustive and cannot leak state across sessions.

- **Cache boundary rule.** `getPost` is `'use cache'`-wrapped. Any auth or
  session logic added inside it in the future will silently stop working.
  Reviewers should check that `PostService.findAndCount`'s permission check for
  `unpublished` is outside the cache boundary, and that this pattern is visible
  enough to deter future violations.

- **`deletePost` cache fix bundled into PR 2.** `deletePost` does not currently
  call `revalidateTag(CACHE_TAGS.post)`. This is a pre-existing bug being fixed
  in PR 2 as a bundled change. Reviewers should be aware this fix is load-bearing
  for cache correctness after the new `CACHE_TAGS.post` tag is introduced.

---

## Remaining Open Todos

None.

---

## References

- Architecture entry point: [`plans/README.md`](./plans/README.md)
- Decision log: [`decisions.md`](./decisions.md)
- Requirements: [`inputs/requirements.md`](./inputs/requirements.md)
- Constraints: [`inputs/constraints.md`](./inputs/constraints.md)
- Rollout plan (12 PRs): [`plans/rollout-strategy.md`](./plans/rollout-strategy.md)
- Risks resolved: [`plans/risks-open-questions.md`](./plans/risks-open-questions.md)
