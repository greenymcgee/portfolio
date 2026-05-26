# Status — edit-post

| Field | Value |
|-------|-------|
| **Phase** | Implementation in progress |
| **Current Focus** | T30 — split EDIT-POST-10 (Description Button) into separate Description and Close Button PRs; PRs 8–9 refined, PR-18 added |
| **Current PR** | PR 7 (done, pending review) |
| **Blocked** | No |
| **Last updated** | 2026-05-26 |
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
| 5 | Backend: `getPosts` unpublished filter | [EDIT-POST-5](../jira/pr-05.md) | Done |
| 5.5 | `Switch` variant prop — `default`, `inverted`, `primary` | [EDIT-POST-5.5](../jira/pr-05.5.md) | Done |
| 6 | `PostsPageAdminMenuContent` unpublished toggle | [EDIT-POST-6](../jira/pr-06.md) | Done |
| 7 | Edit page — core structure + autosave | [EDIT-POST-7](../jira/pr-07.md) | Done |
| 8 | Edit page — title + RTE styles | [EDIT-POST-8](../jira/pr-08.md) | Ready |
| 9 | Edit page — sticky action bar + RTE controls | [EDIT-POST-9](../jira/pr-09.md) | Ready |
| 18 | Edit page — AutoSaveStatus indicator | [EDIT-POST-18](../jira/pr-18.md) | Ready |
| 10 | Description button + Close button | [EDIT-POST-10](../jira/pr-10.md) | Ready |
| 11 | Backend: `togglePostPublishedStatus` action, service, repository + `UpdatePostDto` extensions | [EDIT-POST-11](../jira/pr-11.md) | Ready |
| 12 | `createPost` draft flow + remove `/posts/new` + Edit button | [EDIT-POST-12](../jira/pr-12.md) | Design pending |
| 13 | Fix `/posts/[id]` stale content after autosave | [EDIT-POST-13](../jira/pr-13.md) | Not started |
| 14 | Edit page — error handling + `not-found.tsx` | [EDIT-POST-14](../jira/pr-14.md) | Design pending |
| 15 | Edit page — loading skeleton | [EDIT-POST-15](../jira/pr-15.md) | Design pending |
| 16 | Edit page — generic error UI | [EDIT-POST-16](../jira/pr-16.md) | Design pending |
| 17 | `PublishUnpublishButton` component | [EDIT-POST-17](../jira/pr-17.md) | Ready |

## Open Todos

| # | Summary | Impact |
|---|---------|--------|
| T16 | ~~Re-assess partial unique index on Post.title~~ | Resolved → D23 |
| T17 | ~~Relax UpdatePostDto — description and content are optional for autosave~~ | Resolved → D26 |
| T18 | ~~Restructure rollout — defer /posts/new deletion; move rename + modal earlier~~ | Resolved → D24 |
| T19 | ~~Description modal — manual Save button instead of autosave on close~~ | Resolved → D27 |
| T20 | ~~Move unpublished filter earlier in rollout (after migration, not last)~~ | Resolved → D24 |
| ~~T21~~ | ~~Revise `useAutoSave` call-site plan~~ | Resolved → D31 |
| T22 | ~~404 handling for the edit page~~ | Resolved → D35 (absorbed into PR 14) |
| T23 | Breadcrumbs for `/posts/[id]` and `/posts/[id]/edit` | Cancelled → D38 |
| T24 | Conditional `<SiteNavbar />` — hidden on login + post pages; `<AdminMenuDialog />` still shown | Open — needs decision |
| T28 | ~~Revisit architecture + Jira tickets once pending designs land~~ | Resolved → D39 |
| T25 | ~~Skeleton and error states for edit page~~ | Resolved → D35 (split → PR 14 error handling, PR 15 skeleton deferred) |
| T26 | Skeleton component install (`npx shadcn add skeleton`) + implementation-time discovery | Open |
| T27 | Document `EditPostContent` form state wrapper — component boundaries, prop contracts, `cancelDebounce` threading | Open |
| T29 | Link design-map screens to the PRs that implement them | Open |
| T32 | Description modal save does not update main form state | Open |
| T31 | ~~Split PR-11 into frontend and backend tickets~~ | Resolved → D41 |
| T30 | Ticket refinement and potential breakdown review | Open |
