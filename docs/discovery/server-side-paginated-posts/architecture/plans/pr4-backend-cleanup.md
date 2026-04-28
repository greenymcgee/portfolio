# PR 4 — Backend Cleanup

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §6 "PR 4".

Pure deletion. No new code, no frontend changes. Ship promptly after
PR 3 soaks through at least one delete-flow exercise.

## Deletions

| File | What happens |
| --- | --- |
| `app/api/posts/__tests__/GET.db.test.ts` | **Deleted** entirely |
| `GET` export in `app/api/posts/route.ts` | **Removed** — file becomes POST-only |
| GET handler in `test/servers/postsServer.ts` | **Removed** from `handlers` array |
| `mockGetPostsResponse` in `test/servers/postsServer.ts` | **Deleted** export |

## `app/api/posts/route.ts` after PR 4

The file keeps only the `POST` export (`createPost` still uses HTTP).
Verify the `POST` export and all its imports are untouched.

```typescript
// Before PR 4: exports GET and POST
// After PR 4: exports POST only

export async function POST(request: Request) {
  // unchanged
}
```

If deleting the `GET` export leaves unused imports in the file, clean
them up in the same commit.

## `test/servers/postsServer.ts` after PR 4

```typescript
// Remove from handlers array:
//   http.get(getApiUrl('posts'), ({ request: { url } }) => { … })

// Remove export:
//   export function mockGetPostsResponse(…) { … }

// Keep:
//   postsServer (setupServer wrapper)
//   http.post(getApiUrl('posts'), …) handler
//   mockPostsCreateResponse export
//   http.get(getApiUrl('authSession'), …) handler
//   http.post(getApiUrl('authLog'), …) handler
```

Also check `test/servers/index.ts` — if `mockGetPostsResponse` was
re-exported from the barrel, remove that line too.

## Grep checklist before PR 4 ships

- `mockGetPostsResponse` — grep returns zero hits beyond the deletion.
- `API_ROUTES.posts` in `GET`-request contexts — grep returns zero hits
  in app code (only the POST request remains in
  `postPostCreateRequest.ts`).
- `app/api/posts/__tests__/GET.db.test.ts` — confirm deleted.

## Why ship PR 4 separately

The GET handler is dead code after PR 3 (no in-app callers), but it's
still on `main` as a working public route. Shipping PR 4 as a separate,
scoped deletion:
- Keeps PR 3's diff focused on the read-path migration.
- Gives PR 3 time to soak before irreversibly removing the escape hatch.
- Makes the deletion easily revertable if something unexpected depends
  on the route.

## Reversibility

If a regression surfaces post-PR 4 requiring the GET handler, restore
it from git history. No frontend changes are needed — PR 3's `LatestPosts`
does not call the route.
