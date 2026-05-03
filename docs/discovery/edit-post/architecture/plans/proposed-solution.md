# Proposed Solution — edit-post

_Source: [`../architecture.md`](../architecture.md) § Proposed Solution_

## Overview

Two new server actions (`updatePost`, `publishPost`) and one new page
(`/posts/[id]/edit`) form the core of the feature. The existing `createPost`
action is updated to create a minimal draft and redirect to the edit page rather
than to a form. The existing `/posts/new` page and `CreatePostForm` are deleted.

## New Backend Components

| Component | Type | Purpose |
|-----------|------|---------|
| `UpdatePostDto` | DTO class | Validates `{ id, title, description, content }` |
| `update-post.schema.ts` | Zod schema | Schema used by `UpdatePostDto` |
| `PublishPostDto` | DTO class | Validates `{ id, publishing: boolean, title, description, content }` |
| `publish-post.schema.ts` | Zod schema | Schema used by `PublishPostDto` |
| `PostService.update` | Service method | Auth + delegates to `PostRepository.update` |
| `PostRepository.update` | Repository method | DB write: title, description, content |
| `PostService.publish` | Service method | Auth + publish validation + delegates to `PostRepository.publish` |
| `PostRepository.publish` | Repository method | DB write: sets/clears `publishedAt` |
| `updatePost` | Server action | Autosave entry point |
| `publishPost` | Server action | Publish/Unpublish entry point |

## Updated Backend Components

| Component | Change |
|-----------|--------|
| `PostService.findAndCount` | Accepts `unpublished` flag; permission-checks before passing to repository |
| `getPost` | Wrapped in `'use cache'` with `CACHE_TAGS.post` |
| `createPost` | Creates minimal draft; redirects to `/posts/[id]/edit` instead of form |
| `deletePost` | Adds `revalidateTag(CACHE_TAGS.post)` |
| `FindAndCountPostsDto` | Adds `unpublished?: string` field |
| `CACHE_TAGS` | Adds `post: 'post'` entry |
| `ROUTES` | Adds `editPost(id)` → `/posts/${id}/edit`; removes `newPost` |

## New Frontend Components

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| `app/posts/[id]/edit/page.tsx` | sync RSC | `app/` | Auth guard + `<Suspense>` wrapper |
| `EditPostContent` | async RSC | `features/posts/components/` | Fetches post via `getPost`; hands data to client |
| `EditPostClient` | Client component | `features/posts/components/` | Owns all editor state, autosave logic, `LexicalComposer` |
| `ActionBar` | Client component | `features/posts/components/` | Sticky top bar; contains toolbar + buttons |
| `SaveStateIndicator` | Client component | `features/posts/components/` | Four-state autosave status display |
| `TitleInput` | Client component | `features/posts/components/` | Auto-focused invisible title input |
| `PublishedAtSubtitle` | Component | `features/posts/components/` | Static `<time>` element |
| `PublishUnpublishButton` | Client component | `features/posts/components/` | Publish/unpublish toggle with disabled state |
| `DescriptionButton` | Client component | `features/posts/components/` | Opens description modal |
| `DescriptionModal` | Client component | `features/posts/components/` | Shadcn Dialog wrapping textarea |
| `CloseButton` | Client component | `features/posts/components/` | Flush + redirect; no-title confirmation |
| `useAutoSave` | Hook | `features/posts/hooks/` | Debounce logic with cancel/flush interface |
| New `RichTextEditor` | Component | `globals/components/richTextEditor/` | No internal composer, no embedded toolbar |
| `globals/components/ui/dialog/` | Component | `globals/components/ui/` | Shadcn Dialog split into one-per-directory |

## Updated Frontend Components

| Component | Change |
|-----------|--------|
| `RichTextEditor` | Renamed → `LegacyRichTextEditor` (PR 5); existing consumers unaffected |
| `ToolbarPlugin` | Re-exported from `richTextEditor/index.ts` for use in `ActionBar` |
| `PostPageAdminMenuContent` | Adds Edit link; converts New Post to `<form action={createPost}>` |
| `PostsPageAdminMenuContent` | Adds Unpublished toggle; converts New Post to `<form action={createPost}>` |
| `Pagination` | Gains `unpublished?: boolean` prop; appends `&unpublished=true` to page links when set |

## Deleted Files (PR 4)

| File | Replacement |
|------|------------|
| `app/posts/new/page.tsx` | `/posts/[id]/edit` page |
| `features/posts/components/createPostForm/` | N/A — form replaced by draft-redirect flow |
| `ROUTES.newPost` | `ROUTES.editPost(id)` |
