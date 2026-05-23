# Edit Post — Design Pending

> Items that require Figma design before implementation can begin. Each entry notes
> what specifically is missing, which component uses it, and which PR will implement it.

---

## Error States

### Autosave failure
- **What's needed:** Visual treatment when `updatePost` returns an error during autosave. Could be inline text in `SaveStateIndicator`, a color change, an icon — not yet designed.
- **Component:** `SaveStateIndicator` (ERROR state)
- **PR:** 8 or 9 (wherever `SaveStateIndicator` is styled)

### Description modal Save failure
- **What's needed:** What `DescriptionModal` shows when `updatePost` fails. Could be inline error text below the textarea, a banner, or something else — not yet designed.
- **Component:** `DescriptionModal`
- **PR:** 10

### Close button save failure
- **What's needed:** What happens when the `CloseButton` form submission fails. Could be an error state on the page, a modal, or inline — not yet designed.
- **Component:** `CloseButton`
- **PR:** 10

---

## Loading / In-flight States

### Closing (pending state)
- **What's needed:** Visual treatment while the `CloseButton` form is submitting — what the button or page shows between the user clicking Close and the redirect completing.
- **Component:** `CloseButton`
- **PR:** 10

---

## Success / Confirmation Notifications

### Publish success
- **What's needed:** Sonner toast message content and styling. The plan to use Sonner is confirmed; the exact copy and visual treatment are not.
- **Component:** `PublishUnpublishButton` (publish path)
- **PR:** 11

### Publish failure
- **What's needed:** Sonner toast message content and styling when `publishPost` fails on the publish path.
- **Component:** `PublishUnpublishButton` (publish path)
- **PR:** 11

### Unpublish failure
- **What's needed:** Sonner toast message content and styling when `publishPost` fails on the unpublish path.
- **Component:** `PublishUnpublishButton` (unpublish path)
- **PR:** 11
