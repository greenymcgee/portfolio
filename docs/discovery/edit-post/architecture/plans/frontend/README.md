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
                    │     ├── AutoSaveStatus
                    │     ├── DescriptionButton  → DescriptionModal (Dialog)
                    │     ├── PublishUnpublishButton
                    │     └── CloseButton
                    ├── TitleInput               ← auto-focused on mount
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

See [`./icon-map.md`](./icon-map.md) for the full icon reference including toolbar controls, disabled-state rules, and Lucide React import names.

| UI Element | Lucide React import | Used In |
|-----------|---------------------|---------|
| Undo | `Undo2` | `ToolbarPlugin` |
| Redo | `Redo2` | `ToolbarPlugin` |
| Bold / Italic / Underline / Strikethrough | `Bold`, `Italic`, `Underline`, `Strikethrough` | `ToolbarPlugin` |
| Align left / center / right | `AlignLeft`, `AlignCenter`, `AlignRight` | `ToolbarPlugin` |
| Bullet / numbered list | `List`, `ListOrdered` | `ToolbarPlugin` |
| Block type selector | `ChevronDown` | `ToolbarPlugin` |
| Saving spinner | `Loader2Icon` (via `<Spinner className="size-3" />`) | `AutoSaveStatus` |
| Close | `X` | `CloseButton` |
| Edit | `SquarePen` | `PostPageAdminMenuContent` |

## Detailed Specs

- **Per-component specs** (save-state indicator, buttons, modals): [`./components.md`](./components.md)
- **Icon & asset reference** (all icons, disabled states, import names): [`./icon-map.md`](./icon-map.md)
- **State management** (autosave wiring, inline debounce, `DescriptionModal` action state): [`./state-management.md`](./state-management.md)
