# Icon & Asset Map — edit-post

_Derived from Figma design context. Figma uses kebab-case names (`lucide/bold`); Lucide React uses PascalCase (`Bold`)._

## All Icons

| UI Element | Figma icon | Lucide React import | Used In |
|-----------|-----------|---------------------|---------|
| Undo | `lucide/undo` | `Undo2` | `ToolbarPlugin` |
| Redo | `lucide/redo` | `Redo2` | `ToolbarPlugin` |
| Bold | `lucide/bold` | `Bold` | `ToolbarPlugin` |
| Italic | `lucide/italic` | `Italic` | `ToolbarPlugin` |
| Underline | `lucide/underline` | `Underline` | `ToolbarPlugin` |
| Strikethrough | `lucide/strikethrough` | `Strikethrough` | `ToolbarPlugin` |
| Align left | `lucide/align-left` | `AlignLeft` | `ToolbarPlugin` |
| Align center | `lucide/align-center` | `AlignCenter` | `ToolbarPlugin` |
| Align right | `lucide/align-right` | `AlignRight` | `ToolbarPlugin` |
| Bullet list | `lucide/list` | `List` | `ToolbarPlugin` |
| Numbered list | `lucide/list-ordered` | `ListOrdered` | `ToolbarPlugin` |
| Block type selector | `lucide/chevron-down` | `ChevronDown` | `ToolbarPlugin` (dropdown trigger) |
| Saving spinner | `lucide/loader-circle` | `Loader2Icon` (via `<Spinner className="size-3" />`) | `AutoSaveStatus` |
| Close | `lucide/x` | `X` | `CloseButton` |
| Edit | `lucide/square-pen` | `SquarePen` | `PostPageAdminMenuContent` |

## Toolbar Disabled States

RTE controls dim (`opacity-50`) when the editor content area is not focused. This applies to:
Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, and the Block Select dropdown.

Undo and Redo follow their own enabled/disabled logic (based on editor history depth) and are not
subject to focus-based dimming.

Description, Publish/Unpublish, and Close buttons are **not** dimmed by focus state.

## Notes

- `Loader2Icon` is the correct import name in this project (see `globals/components/ui/spinner/spinner.tsx`). Figma names this `lucide/loader-circle`. Do not import `LoaderCircle` — use the existing `<Spinner>` component instead.
- `Undo2` / `Redo2` are the Lucide React names for the undo/redo icons (arrows with a return arc). The base `Undo` / `Redo` names exist in older Lucide versions; use the `2` suffix variants.
