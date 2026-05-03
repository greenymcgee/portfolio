# Risks & Open Questions — edit-post

_Source: [`../architecture.md`](../architecture.md) § Risks / Open Questions_

## Risks

| Risk | Severity | Status | Mitigation |
|------|----------|--------|-----------|
| R1: `ToolbarPlugin` in the action bar requires `LexicalComposer` to wrap both areas — highest frontend complexity | Medium | Resolved → D5, D21 | `EditPostClient` owns the `LexicalComposer`. New `RichTextEditor` has no internal composer. Existing consumers use `LegacyRichTextEditor` unchanged. |
| R2: Partial unique index via raw SQL migration — Prisma may overwrite on future `migrate dev` runs | Low | Resolved → D2 | The migration is hand-authored; Prisma will not regenerate it. The `prisma/migrations/` folder is the source of truth. |
| R3: `createPost` relied on `@default("{}")` at the DB level | Low | Resolved → D2 | `CreatePostDto` generates the initial Lexical state when no `content` is provided. Migration drops the default in PR 1. |
| R4: `getPosts` cache + unpublished filter create two cache entries | Low | Resolved → D7, D11 | Both entries are tagged `'posts'`; `revalidateTag('posts')` invalidates both. |
| R5: Autosave / Publish race condition | Low | Resolved → D20 | Publish cancels the debounce and calls `publishPost` directly with current form state. `updatePost` never touches `publishedAt`, so no subsequent autosave can clear the published state. |

## Open Questions

None — all risks resolved during refinement (Step 3). See [`../decisions.md`](../decisions.md) for full rationale on each decision referenced above.
