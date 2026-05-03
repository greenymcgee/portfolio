# Rollout Strategy — edit-post

_Source: [`../architecture.md`](../architecture.md) § Rollout Plan_

## PR Sequence

| PR | Scope | Key Deliverables |
|----|-------|-----------------|
| 1 | Migration | `@unique` constraint on `Post.title`; remove `content` `@default("{}")` |
| 2 | Backend: `updatePost` | `UpdatePostDto`, `PostService.update`, `PostRepository.update`, `updatePost` action, `getPost` caching, `deletePost` cache fix, tests |
| 3 | Backend: `getPosts` filter | `unpublished` param in DTO/schema; `PostService.findAndCount` auth check; repository `WHERE` clause; tests |
| 4 | `createPost` + edit button | Draft redirect; remove `/posts/new`; `PostsPageAdminMenuContent` → form; `PostPageAdminMenuContent` → Edit link + form; `ROUTES.editPost`; tests |
| 5 | `LegacyRichTextEditor` rename | Rename existing `RichTextEditor` → `LegacyRichTextEditor`; update all consumers; no behaviour changes |
| 6 | Edit page — core | `page.tsx`, `EditPostContent`, `EditPostClient`, `useAutoSave`, auth guard, tests |
| 7 | Title + RTE styles | Invisible title input; editor area styles matching `design-reference.png`; `publishedAt` subtitle |
| 8 | Sticky action bar + RTE controls | `ActionBar`; new `RichTextEditor`; `ToolbarPlugin` in `ActionBar`; `LexicalComposer` in `EditPostClient` |
| 9 | Modal component | `globals/components/ui/dialog/`; Shadcn Dialog install; tests |
| 10 | Description + Close buttons | Description modal; Close flush-and-redirect; no-title confirmation dialog; tests |
| 11 | Publish/Unpublish button | `publishPost` action; `PublishUnpublishButton`; disabled state; Publish flush sequence; tests |
| 12 | Unpublished filter | `PostsPageAdminMenuContent` toggle; `Pagination` `unpublished` prop; tests |

## Hard Dependencies

```
PR 1  ──► everything
           (index must exist before unique errors are meaningful;
            content default must be gone before createPost stops relying on it)

PR 2  ──► PR 4
           (updatePost must exist before autosave is wired up)

PR 5  ──► PR 6, 7, 8
           (LegacyRichTextEditor rename must land before any edit page
            work touches the RichTextEditor name)

PR 9  ──► PR 10
           (Dialog must exist before Description modal and confirmation dialog)

PR 4 is the only PR that removes user-visible functionality (/posts/new).
Ship after PR 2 is verified in staging.
```

## Rollback

Each PR is independently revertable.

- **PRs 1–3:** Backend-only with no user-visible changes.
- **PR 4:** First user-visible change — `/posts/new` removed. Revert PR 4 to restore.
- **PRs 5–12:** Edit page work. Revert individual PRs; existing users unaffected until PR 4 lands.

## No Feature Flag

The feature is gated by admin permission (`posts.update`, `posts.publish`).
Anonymous users are unaffected at every stage. No additional feature flag is needed.
