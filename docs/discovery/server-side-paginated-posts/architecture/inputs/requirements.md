# Server-Side Paginated Posts

> **For LLMs**: This is the primary input for engineering discovery. Read carefully — do not invent requirements that aren't stated here. If information is missing, add it to the Open Questions section and flag it during discovery.

---

## Definitions

Define key terms used throughout this document. Clarify any role names, domain concepts, or product terminology that could be ambiguous.

| Term | Definition |
| ---- | ---------- |
| Pagination | The process of dividing a dataset into multiple pages, typically with a fixed number of items per page. |

---

## Overview

### What is this feature?

Currently, the posts page use a hook called `useGetPaginatedPostsQuery` to fetch
the posts. It uses the baseAPI to reach out to the `/api/posts` endpoint, and
the goal is to learn how to replace this client-side implementation with a fully
server-side implementation. There is a `getPost` server action that follows the
pattern we'd want to use to replace the API endpoint entirely. The end goal is
ultimately to not have any API endpoints, but instead follow current Next.js
patterns for things that I would typically use SWR for.

### What problem does it solve?

Right now, I believe there is not a good way fully invalidate the
useGetPaginatedPostsQuery hook because calling `revalidateTag` or
`revalidatePath` from the server action does not invalidate the hook on the
client. The goal is primarily to gain more understanding in the current best
practices for this problem in Next.js 16.

### What does success look like?

- The engineer has a good understanding of caching in Next.js 16.
- A server-side implementation of the posts page is created that is fully
invalidated when the posts are changed.

---

## Personas & Permissions

Only admins can create, delete, and update posts. Currently, there is not any
update functionality. That is out of scope for this project.

---

## User Flows

### Flow 1: Viewing Posts (User or Admin)

1. User navigates to the posts page...
2. User sees a list of posts...
3. User sees a pagination list...
4. User clicks on the next page...
5. User clicks on a post...
6. User is taken to the post page...

### Flow 2: Creating a Post (Admin)

1. Admin User navigates to the posts page...
2. Admin User sees the AdminMenuDialog and opens...
3. Admin User clicks on the "New Post" button...
4. Admin User is taken to the new post page...
5. Admin User fills out the form...
6. Admin User clicks on the "Create Post" button...
7. Admin User is taken back to the posts page...
8. Admin User sees the new post...

### Flow 3: Deleting a Post (Admin)

1. Admin User navigates to the posts page...
2. Admin User sees the AdminMenuDialog and opens...
3. Admin User clicks on the "Delete" button...
6. Admin User is taken back to the posts page...
7. Admin User sees the post is deleted...

### Flow 4: Deleting a Post from Page 2 (Admin)

1. Admin User navigates to the posts page and clicks on page 2...
2. Admin User sees the AdminMenuDialog and opens...
3. Admin User clicks on the "Delete" button...
4. Admin User is taken back to the posts page and clicks on page 2...
7. Admin User sees the post is deleted...

---

## Designs

- **Status**: Not needed
- **Design map**: Skip the design map for this project.

---

## Data & Fields

The posts page displays a list of posts, and the admin menu dialog displays a
list of actions that can be performed on the posts.

### Data Lifecycle

- How is this data created?
- Only admins can create, delete, and update posts.
- Posts are deleted when the admin clicks the "Delete" button.
- No sensitive data is stored in the posts.

### Constraints

No additional constraints file is needed. This is a simple project.

- **Timeline**: No hard deadlines or release targets.
- **Dependencies**: This does not depend on other features, teams, or third-party services.
- **Technical constraints**: Must use specific tech, integrate with existing systems, etc.
- **Compliance/Legal**: No regulatory or legal requirements.

---

## Rollout & Feature Flags

This feature will go straight to main. Depending on the size of the work, there
might be a need for a backend PR and a frontend. If it's small enough, it will
all be in one PR.

---

## Edge Cases & Error States

The current error handling and loading states are sufficient for this feature.
Updating them is out of scope.

---

## Open Questions

What is the best way to invalidate paginated data in Next.js 16?

---

## References

None.
