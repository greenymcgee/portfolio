# Rollout Strategy — edit-post

_Source: [`../architecture.md`](../architecture.md) § Rollout Plan_

## PR Sequence

| PR | Scope | Key Deliverables |
|----|-------|-----------------|
| 1 | `LegacyRichTextEditor` rename | Rename existing `RichTextEditor` → `LegacyRichTextEditor`; update all consumers; no behaviour changes |
| 2 | Modal component | `globals/components/ui/dialog/`; Shadcn Dialog install; tests |
| 3 | Migration | `@unique` constraint on `Post.title`; remove `content` `@default("{}")` |
| 4 | Backend: `updatePost` | `UpdatePostDto`, `PostService.update`, `PostRepository.update`, `updatePost` action, `getPost` caching, `deletePost` cache fix, tests |
| 5 | Backend: `getPosts` filter | `unpublished` param in DTO/schema; `PostService.findAndCount` auth check; repository `WHERE` clause; tests |
| 6 | `PostsPageAdminMenuContent` unpublished toggle | Unpublished toggle UI; `Pagination` `unpublished` prop; tests |
| 7 | Edit page — core | `page.tsx`, `EditPostContent`, `EditPostClient`, `useAutoSave`, auth guard, tests |
| 8 | Title + RTE styles | Invisible title input; editor area styles matching `design-reference.png`; `publishedAt` subtitle |
| 9 | Sticky action bar + RTE controls | `ActionBar`; new `RichTextEditor`; `ToolbarPlugin` in `ActionBar`; `LexicalComposer` in `EditPostClient` |
| 10 | Description + Close buttons | Description modal; Close flush-and-redirect; no-title confirmation dialog; tests |
| 11 | Publish/Unpublish button | `publishPost` action; `PublishUnpublishButton`; disabled state; Publish flush sequence; tests |
| 12 | `createPost` + edit button + remove `/posts/new` | Draft redirect; remove `/posts/new`; `PostsPageAdminMenuContent` → form; `PostPageAdminMenuContent` → Edit link + form; `ROUTES.editPost`; tests |

## Hard Dependencies

```
PR 3  ──► everything backend
           (index must exist before unique errors are meaningful;
            content default must be gone before createPost stops relying on it)

PR 1  ──► PR 7, PR 8, PR 9
           (LegacyRichTextEditor rename must land before any edit page
            work touches the RichTextEditor name)

PR 2  ──► PR 10, PR 11
           (Dialog must exist before Description modal, confirmation dialog,
            and any publish/unpublish confirmation)

PR 4  ──► PR 7, PR 12
           (updatePost must exist before autosave is wired up in the edit page;
            createPost redirect must ship after the edit page is functional)

PR 5  ──► PR 6
           (backend filter must exist before the UI toggle is wired)

PR 9  ──► PR 10, PR 11
           (ActionBar must exist before Description/Close and Publish buttons land)

PR 12 is the only PR that removes user-visible functionality (/posts/new).
Ship after all edit page PRs (PR 7–11) are verified in staging.
```

## Rollback

Each PR is independently revertable.

- **PRs 1–2:** Rename and Dialog install — no user-visible changes. Safe to revert at any time.
- **PRs 3–6:** Backend + unpublished filter. No user-visible changes to the creation flow.
- **PRs 7–11:** Edit page work. Revert individual PRs; admin creation flow unaffected until PR 12 lands.
- **PR 12:** First user-visible change — `/posts/new` removed. Revert PR 12 to restore.

## No Feature Flag

The feature is gated by admin permission (`posts.update`, `posts.publish`).
Anonymous users are unaffected at every stage. No additional feature flag is needed.
