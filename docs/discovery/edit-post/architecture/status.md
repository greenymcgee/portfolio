# Status — edit-post

| Field | Value |
|-------|-------|
| **Phase** | Step 4 complete — 1 open todo (T15: migration approach) |
| **Current PR** | None — no PRs opened yet |
| **Blocked** | No |
| **Last updated** | 2026-05-03 |

## Requirements Review Progress

| # | Comment | Status |
|---|---------|--------|
| 1 | Untitled draft / unique title collision | Resolved → D1, D8 |
| 2 | Publish/Unpublish navigation behavior | Resolved → D9 |
| 3–6 | Spelling errors | Resolved — corrected in requirements.md |
| 7 | Flow 1 publish destination | Resolved → D9 |
| 8, 11, 13 | Close destination mismatch | Resolved → D10 (success criteria and scope updated to match flows) |
| 9 | Spelling error | Resolved — corrected in requirements.md |
| 10 | Spelling error | Resolved — corrected in requirements.md |
| 12 | Design status contradiction | Resolved — status updated to "Design reference only" |
| 3 | Data lifecycle missing deletion path | Resolved — placeholder approach eliminates untitled-draft deletion path; lifecycle section accurate |

## PR Checklist

| # | Title | Status |
|---|-------|--------|
| 1 | Database migration | Not started |
| 2 | Backend: `updatePost` | Not started |
| 3 | Backend: `getPosts` unpublished filter | Not started |
| 4 | `createPost` draft flow + remove `/posts/new` + Edit button | Not started |
| 5 | `LegacyRichTextEditor` rename | Not started |
| 6 | Edit post page — core structure + autosave | Not started |
| 7 | Edit post page — title + RTE styles | Not started |
| 8 | Edit post page — sticky action bar + RTE controls | Not started |
| 9 | Modal component (Shadcn Dialog) | Not started |
| 10 | Description button + Close button | Not started |
| 11 | Publish/Unpublish button | Not started |
| 12 | PostsPageAdminMenuContent unpublished filter | Not started |

## Open Todos

| # | Title | Status |
|---|-------|--------|
| T15 | Revisit migration approach — raw SQL vs Prisma migration | Open |
