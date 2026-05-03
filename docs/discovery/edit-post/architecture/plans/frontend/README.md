# Frontend — edit-post

_Source: [`../architecture.md`](../architecture.md) § Frontend_

## Component Hierarchy

```
app/posts/[id]/edit/page.tsx          ← sync RSC; auth guard; <Suspense>
  └── EditPostContent                 ← async RSC; fetches post via getPost
        └── LexicalComposer           ← single composer wraps entire page
              └── EditPostClient      ← 'use client'; owns all editor state
                    ├── ActionBar (sticky)
                    │     ├── ToolbarPlugin      ← inside LexicalComposer context
                    │     ├── SaveStateIndicator
                    │     ├── DescriptionButton  → DescriptionModal (Dialog)
                    │     ├── PublishUnpublishButton
                    │     └── CloseButton
                    ├── TitleInput               ← auto-focused on mount
                    ├── PublishedAtSubtitle       ← static <time>, set on load
                    └── RichTextEditor
```

## `LexicalComposer` Strategy (→ D5, D21)

`ToolbarPlugin` uses `useLexicalComposerContext()` and must be a descendant of
the same `LexicalComposer` as the editor content. `EditPostClient` owns and
renders the `LexicalComposer`, wrapping both `ActionBar` (which contains
`ToolbarPlugin`) and the new `RichTextEditor`.

The new `RichTextEditor` is purpose-built for this page:
- No internal `LexicalComposer`
- No embedded `ToolbarPlugin`

`ToolbarPlugin` is exported alongside `RichTextEditor` from
`globals/components/richTextEditor/index.ts`.

The existing `RichTextEditor` is renamed `LegacyRichTextEditor` in a dedicated
PR (PR 5) before the edit page work begins. It is otherwise unchanged —
existing consumers are unaffected. The new `RichTextEditor` becomes the
foundation going forward.

## Icon & Asset Mapping

| UI Element | Icon | Library | Used In |
|-----------|------|---------|---------|
| Edit button | `SquarePen` | lucide-react | `PostPageAdminMenuContent` |

## Detailed Specs

- **Per-component specs** (useAutoSave, save-state indicator, buttons, modals, publishedAt): [`./components.md`](./components.md)
- **State management** (autosave hook interface, state machine): [`./state-management.md`](./state-management.md)
