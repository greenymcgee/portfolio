# Status — edit-post

| Field | Value |
|-------|-------|
| **Phase** | Implementation in progress |
| **Current Focus** | PR 7 done; resolve open items from updates-05-16-2026.md before shipping PRs 8–12 |
| **Current PR** | PR 7 (done, pending review) |
| **Blocked** | No |
| **Last updated** | 2026-05-16 |
| **Branch** | 170-edit-post-page |

## Requirements Review Progress

| # | Comment | Status |
|---|---------|--------|
| 1 | Untitled draft / unique title collision | Resolved → D8, D23 (D1 superseded) |
| 2 | Publish/Unpublish navigation behavior | Resolved → D9 |
| 3–6 | Spelling errors | Resolved — corrected in requirements.md |
| 7 | Flow 1 publish destination | Resolved → D9 |
| 8, 11, 13 | Close destination mismatch | Resolved → D10 (success criteria and scope updated to match flows) |
| 9 | Spelling error | Resolved — corrected in requirements.md |
| 10 | Spelling error | Resolved — corrected in requirements.md |
| 12 | Design status contradiction | Resolved — status updated to "Design reference only" |
| 3 | Data lifecycle missing deletion path | Resolved — placeholder approach eliminates untitled-draft deletion path; lifecycle section accurate |

## PR Checklist

| # | Title | Ticket | Status |
|---|-------|--------|--------|
| 1 | `LegacyRichTextEditor` rename | [EDIT-POST-1](../jira/pr-01.md) | Done |
| 2 | Modal component (Shadcn Dialog) | [EDIT-POST-2](../jira/pr-02.md) | Done |
| 3 | Database migration | [EDIT-POST-3](../jira/pr-03.md) | Done |
| 4 | Backend: `updatePost` | [EDIT-POST-4](../jira/pr-04.md) | Done |
| 5 | Backend: `getPosts` unpublished filter | [EDIT-POST-5](../jira/pr-05.md) | In progress |
| 5.5 | `Switch` variant prop — `default`, `inverted`, `primary` | [EDIT-POST-5.5](../jira/pr-05.5.md) | Done |
| 6 | `PostsPageAdminMenuContent` unpublished toggle | [EDIT-POST-6](../jira/pr-06.md) | Not started |
| 7 | Edit page — core structure + autosave | [EDIT-POST-7](../jira/pr-07.md) | Done |
| 8 | Edit page — title + RTE styles | [EDIT-POST-8](../jira/pr-08.md) | Not started |
| 9 | Edit page — sticky action bar + RTE controls | [EDIT-POST-9](../jira/pr-09.md) | Not started |
| 10 | Description button + Close button | [EDIT-POST-10](../jira/pr-10.md) | Not started |
| 11 | Publish/Unpublish button | [EDIT-POST-11](../jira/pr-11.md) | Not started |
| 12 | `createPost` draft flow + remove `/posts/new` + Edit button | [EDIT-POST-12](../jira/pr-12.md) | Not started |
| 13 | Fix `/posts/[id]` stale content after autosave | [EDIT-POST-13](../jira/pr-13.md) | Not started |

## Open Todos

| # | Summary | Impact |
|---|---------|--------|
| T16 | ~~Re-assess partial unique index on Post.title~~ | Resolved → D23 |
| T17 | ~~Relax UpdatePostDto — description and content are optional for autosave~~ | Resolved → D26 |
| T18 | ~~Restructure rollout — defer /posts/new deletion; move rename + modal earlier~~ | Resolved → D24 |
| T19 | ~~Description modal — manual Save button instead of autosave on close~~ | Resolved → D27 |
| T20 | ~~Move unpublished filter earlier in rollout (after migration, not last)~~ | Resolved → D24 |
| ~~T21~~ | ~~Revise `useAutoSave` call-site plan~~ | Resolved → D31 |
| T22 | 404 handling for the edit page — `notFound()` in `EditPostContent` + `not-found.tsx` | Open — deferred post PR-07 |
| T23 | Breadcrumbs for `/posts/[id]` and `/posts/[id]/edit` — own PR | Open |
| T24 | Conditional `<SiteNavbar />` — hidden on login + post pages; `<AdminMenuDialog />` still shown | Open — needs decision |
| T25 | Skeleton and error states for edit page — required before shipping PRs 8–12 | Open |
