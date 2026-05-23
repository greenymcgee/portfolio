# Edit Post — Figma Design Map

> **Purpose**: This file is the semantic bridge between Figma designs and the project's architecture and stories. Figma screens are not named semantically — this map provides the meaning, context, and user intent that Figma alone cannot.
>
> **Who fills this in**: The engineer or PM cataloging the designs. Group screens by feature area. Include the Figma URL, the persona who uses it, what they do there, and what states exist.
>
> **LLM usage**: Extract `fileKey` and `nodeId` from URLs below. Replace `-` with `:` in the `node-id` param (e.g., `node-id=23888-12313` → nodeId `23888:12313`). Use `get_design_context` for screens/components, `get_metadata` to browse sections. If the Figma MCP is not available, use URLs for reference only.

## Design Context

This map catalogs the Figma screens for the edit-post page (`/posts/[id]/edit`).
Screens 1–14 cover the full admin editing flow including loading, error, and save states.

---

## 1. after clicking "New Post"
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=479-577&t=XvWnzfCKOb8Et0AN-4

- **Persona**: Admin
- **Key interactions**: Click "New Post" in the admin menu, redirect to the edit page
- **States**: Empty title input, empty description input (in modal), empty content input

## 2. after published
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=510-1506&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the "Unpublished" toggle and clicks it to unpublish the post
- **States**: Published post, Unpublished post

## 3. skeleton
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=527-1568&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the skeleton loading state
- **States**: Skeleton loading state

## 4. Mobile: action bar is scrollable horizontally
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=550-680&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the action bar is scrollable horizontally
- **States**: Same as desktop

## 5. description modal open
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=530-1643&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User clicks the "Description" button in the action bar and sees the description modal open
- **States**: Description modal open, description input is focused

## 6. title unique constraint error
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=511-1579&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the title unique constraint error
- **States**: Title unique constraint error

## 7. title Zod errors
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=511-1653&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the title Zod errors
- **States**: Title Zod errors

## 8. content Zod errors
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=511-1736&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the content Zod errors
- **States**: Content Zod errors

## 9. undo or redo active
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=514-625&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the undo or redo active
- **States**: Undo or redo active

## 10. content not focused
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=514-711&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the content not focused
- **States**: Content not focused

## 11. unhandled getPost error
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=514-790&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the unhandled getPost error
- **States**: Unhandled getPost error

## 12. not-found
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=514-1013&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the not-found error
- **States**: Not-found error

## 13. saving
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=553-926&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the saving state
- **States**: Saving state

## 14. saved
https://www.figma.com/design/c6I8C3p7YgtqYJATZQTbiH/Portfolio?node-id=553-935&t=XvWnzfCKOb8Et0AN-4
- **Persona**: Admin
- **Key interactions**: User sees the saved state
- **States**: Saved state
