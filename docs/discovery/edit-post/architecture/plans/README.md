# edit-post — Architecture (Structured)

> Structured form of [`../architecture.md`](../architecture.md). The
> monolithic doc is retained as a single-file reference; this directory
> is the active working copy. Decisions log:
> [`../decisions.md`](../decisions.md). Open todos:
> [`../todos.md`](../todos.md). Status:
> [`../status.md`](../status.md).

## Which Doc Do I Need?

| If you need to … | Read |
| --- | --- |
| Understand the current /posts/new flow and what is being replaced | [`./existing-implementation.md`](./existing-implementation.md) |
| See the full list of new/changed/deleted files and components | [`./proposed-solution.md`](./proposed-solution.md) |
| Know what the user sees end-to-end (8 flows, scope, edge cases) | [`./user-facing-behavior.md`](./user-facing-behavior.md) |
| Implement the DB migration or understand cache invalidation | [`./data-models.md`](./data-models.md) |
| Implement `PostService.update`, `PostService.publish`, or `getPost` caching | [`./services.md`](./services.md) |
| Implement the edit page route guard or server action auth | [`./security-considerations.md`](./security-considerations.md) |
| Understand the component hierarchy and `LexicalComposer` strategy | [`./frontend/README.md`](./frontend/README.md) |
| Implement any individual component (save-state, buttons, modals, publishedAt) | [`./frontend/components.md`](./frontend/components.md) |
| Implement `useAutoSave` or understand the autosave state machine | [`./frontend/state-management.md`](./frontend/state-management.md) |
| Write tests (which project, which cases, which factories) | [`./testing-strategy.md`](./testing-strategy.md) |
| Ship PRs in the right order (12-PR plan + hard dependencies) | [`./rollout-strategy.md`](./rollout-strategy.md) |
| Look up open risks | [`./risks-open-questions.md`](./risks-open-questions.md) |
| See why a decision was made (with alternatives) | [`../decisions.md`](../decisions.md) |

## Document Info

| Field | Value |
| --- | --- |
| Slug | `edit-post` |
| Step | 4 — Structure Architecture |
| Created | 2026-05-03 |
| Last Updated | 2026-05-03 |
| Inputs | [`../inputs/requirements.md`](../inputs/requirements.md), [`../inputs/constraints.md`](../inputs/constraints.md), [`../inputs/design-reference.png`](../inputs/design-reference.png) |
| Pattern source | `features/posts/{post.repository,post.service,dto/create-post.dto,schemas/create-post.schema,actions/createPost,components/createPostForm}.{ts,tsx}` |
| Monolithic source | [`../architecture.md`](../architecture.md) (kept as reference) |

## Project Overview

The edit-post project replaces the `/posts/new` form page with a
Confluence-style inline editor at `/posts/[id]/edit`. Clicking "New Post"
creates a minimal draft immediately and redirects the admin to the editor;
there is no intermediate form. The editor autosaves 1 second after the last
change. A sticky action bar houses the rich-text controls, a Description modal
trigger, a Publish/Unpublish toggle, and a Close button.

On the backend, a new `updatePost` action handles autosave and a `publishPost`
action handles publish/unpublish state. The `getPosts` read path gains an
admin-only `?unpublished=true` filter. The `Post` table receives a migration:
a partial unique index on non-empty titles, and the `content` column drops its
`{}` default.

**Personas:** Admin only. Anonymous users are unaffected — they continue to see
only published posts via the existing `getPosts` path.

### System Context

```
Admin browser
  │
  │  "New Post" click (form action)
  ▼
createPost (server action)
  │  creates minimal draft (placeholder title, empty Lexical state)
  │  redirect → /posts/[id]/edit
  ▼
app/posts/[id]/edit/page.tsx   ← sync RSC; auth guard; <Suspense>
  └── EditPostContent           ← async RSC; getPost (cached)
        └── LexicalComposer     ← single composer; owned by EditPostClient
              └── EditPostClient ('use client')
                    ├── ActionBar (sticky)
                    │     ├── ToolbarPlugin   ← inside LexicalComposer
                    │     ├── SaveStateIndicator
                    │     ├── DescriptionButton → DescriptionModal
                    │     ├── PublishUnpublishButton
                    │     └── CloseButton
                    ├── TitleInput (auto-focused)
                    ├── PublishedAtSubtitle
                    └── RichTextEditor (new — no internal composer)

Autosave path:
  field change → useAutoSave (1s debounce) → updatePost → PostService.update
  → PostRepository.update → DB (title, description, content only)

Publish path:
  Publish click → cancel debounce → publishPost (atomic)
  → PostService.publish → PostRepository.publish → DB (+ publishedAt)
  → revalidateTag(post, posts) → redirect /posts/[id]

Unpublished filter path:
  "Unpublished" toggle → router.push(?unpublished=true)
  → getPosts({ unpublished: 'true' }) → PostService.findAndCount
  → permission check → repository WHERE publishedAt IS NULL
```

## Key Design Decisions

Numbered for cross-reference — each links to [`../decisions.md`](../decisions.md) for full rationale.

1. **Partial unique index, not schema-level `@unique`.** Allows multiple simultaneous empty-title drafts. Hand-written raw SQL migration; Prisma DSL has no `WHERE`-clause support. (D1)
2. **Remove `@default("{}")` from `Post.content`; `CreatePostDto` generates the initial Lexical state.** Eliminates the latent footgun where the `{}` default would break `RichTextEditor`. (D2)
3. **Two separate server actions: `updatePost` (autosave) and `publishPost` (publish/unpublish).** Single responsibility per action; maps cleanly to existing `posts.update` and `posts.publish` permissions. (D3)
4. **Custom `useAutoSave` hook — no new dependency.** `useRef` + `setTimeout`. `startTransition` keeps autosave non-blocking. (D4)
5. **Single `LexicalComposer` owned by `EditPostClient`, wrapping both `ActionBar` and `RichTextEditor`.** The only viable approach for rendering `ToolbarPlugin` outside the editor DOM subtree. (D5, D21)
6. **`publishPost` is atomic — carries all content fields and sets `publishedAt` in one DB write.** Eliminates the sequential flush-then-publish round-trip. (D20)
7. **`createPost` creates a minimal draft and redirects to the edit page.** `/posts/new` page and `CreatePostForm` deleted in PR 4. (D8)
8. **Publish redirects to post detail page; Unpublish is an in-place toggle.** Publish is "done with this"; Unpublish is "pause, then keep editing". (D9)
9. **Save-state indicator handles all autosave feedback; Sonner only for publish/unpublish/close failures.** Avoids redundant toast + indicator for the same event. (D14)
10. **Permission check for `unpublished` flag lives in `PostService.findAndCount`, not in the `'use cache'` layer.** Auth logic must not cross the cache boundary. (D7)
11. **`getPost` cached with a dedicated `CACHE_TAGS.post` tag.** Targeted invalidation — writing post A evicts only post A's detail cache. (D11)
12. **Edit page auth guard: server-side RSC redirect + `useLayoutEffect` belt-and-suspenders.** Matches existing `CreatePostForm` pattern; prevents flash of unauthenticated content. (D16)

## Architecture Docs

### Backend

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Services (`PostService.update`, `PostService.publish`, `findAndCount`, `getPost` caching) | Two new service methods; permission check for `unpublished` flag outside cache boundary | [`./services.md`](./services.md) |
| Data models (migration, cache tags, lifecycle) | Partial unique index via raw SQL; `CACHE_TAGS.post` added; `updatePost` never touches `publishedAt` | [`./data-models.md`](./data-models.md) |
| Security (route guard, action auth, DTO validation) | RSC redirect + `useLayoutEffect`; auth checked per action; no auth inside cache | [`./security-considerations.md`](./security-considerations.md) |

### Frontend (`./frontend/`)

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Component hierarchy + `LexicalComposer` strategy | Single composer in `EditPostClient`; new `RichTextEditor` has no internal composer; `ToolbarPlugin` re-exported | [`./frontend/README.md`](./frontend/README.md) |
| Per-component specs (save-state, buttons, modals, publishedAt, filter) | Four-state indicator; atomic Publish; Close flush-and-redirect; Shadcn Dialog | [`./frontend/components.md`](./frontend/components.md) |
| `useAutoSave` + autosave state machine | `useRef` + `setTimeout`; cancel/flush handles; four UI states | [`./frontend/state-management.md`](./frontend/state-management.md) |

### Cross-cutting

| Area | Key decision summary | Doc |
| --- | --- | --- |
| User-facing behavior (8 flows, scope, edge cases) | Admin-only; anonymous unaffected; 8 flows including duplicate title, unpublished filter | [`./user-facing-behavior.md`](./user-facing-behavior.md) |
| Existing implementation | Current `/posts/new` + `CreatePostForm` flow; what does not exist today | [`./existing-implementation.md`](./existing-implementation.md) |
| Proposed solution | Full list of new/updated/deleted files and components | [`./proposed-solution.md`](./proposed-solution.md) |

### Testing & Rollout

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Testing strategy | DB tests for service/repo/DTO; unit tests for hooks and components; real `postFactory` | [`./testing-strategy.md`](./testing-strategy.md) |
| Rollout (12 PRs) | PR 1 gates everything; PR 5 gates edit page; PR 4 is the only user-visible removal | [`./rollout-strategy.md`](./rollout-strategy.md) |
| Risks & open questions | All 5 risks resolved during refinement | [`./risks-open-questions.md`](./risks-open-questions.md) |

## Existing Patterns Reused

| Concern | Pattern source |
| --- | --- |
| Server action pattern (Action → DTO → Service → Repository → `Result`) | `features/posts/actions/createPost.ts`, `features/posts/post.service.ts` |
| `'use cache'` + `cacheTag` + `revalidateTag` | `features/posts/actions/getPosts.ts` (existing posts caching) |
| `authenticateAPISession()` + `authorizeUser()` in service | `features/posts/post.service.ts` |
| `<form action={serverAction}>` button pattern | `PostPageAdminMenuContent` delete button |
| `useLayoutEffect` auth guard in client component | `features/posts/components/createPostForm/createPostForm.tsx` |
| `*.db.test.ts` integration pattern | `features/posts/actions/__tests__/{getPost,deletePost}.db.test.ts` |
| `postFactory` + `PUBLISHED_POST` / `UNPUBLISHED_POST` fixtures | `test/factories/post.ts`, `test/fixtures/posts.ts` |
| Shadcn component install + one-per-directory split | `globals/components/ui/` existing components |

## MVP Constraints

From [`../inputs/constraints.md`](../inputs/constraints.md):

1. **Admin-only feature.** Anonymous users must be entirely unaffected.
2. **No new external dependencies** beyond Shadcn Dialog (Radix UI, already a transitive dep).
3. **Design reference only** — `inputs/design-reference.png` guides styling but no pixel-perfect requirement.
4. **Existing `RichTextEditor` consumers must not be broken.** Enforced by the `LegacyRichTextEditor` rename in PR 5 before any edit page work touches the component name.

## References

- Requirements: [`../inputs/requirements.md`](../inputs/requirements.md)
- Constraints: [`../inputs/constraints.md`](../inputs/constraints.md)
- Design reference: [`../inputs/design-reference.png`](../inputs/design-reference.png)
- Save-state reference (Confluence): [`../inputs/saved-state.png`](../inputs/saved-state.png)
- Decisions log: [`../decisions.md`](../decisions.md)
- Initial plan: [`../initial-plan.md`](../initial-plan.md)
- Confluence reference: https://greenhouston.atlassian.net/wiki/x/AgAx
