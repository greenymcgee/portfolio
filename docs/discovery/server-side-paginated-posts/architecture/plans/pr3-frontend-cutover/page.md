# `PostsPage` — Sync RSC with Suspense Fallback

> Part of [PR 3 frontend cutover](./README.md) →
> [server-side-paginated-posts architecture](../README.md). Source
> slice: [architecture.md](../../architecture.md) §6.6 "`PostsPage`".

File: `app/posts/page.tsx` (changed).

## Before (current state)

```tsx
export default function PostsPage() {
  return (
    <>
      <AdminMenuContentSetter content={<PostsPageAdminMenuContent />} />
      <main className="mb-23">
        <header className={…}>…</header>
        <div className={…}>
          <article>
            <h2>Latest</h2>
            <Suspense>          {/* no fallback */}
              <LatestPosts />   {/* 'use client' — fallback lives inside */}
            </Suspense>
          </article>
        </div>
      </main>
    </>
  )
}
```

Two problems with the current shape:
1. `<Suspense>` has no `fallback` — the fallback lives *inside*
   `<LatestPosts>` (a Client Component), which means it doesn't stream
   from the server.
2. `<LatestPosts>` is `'use client'`, preventing it from being an async
   RSC.

## After (PR 3)

```tsx
export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  return (
    <>
      <AdminMenuContentSetter content={<PostsPageAdminMenuContent />} />
      <main className="mb-23">
        <header className={…}>…</header>
        <div className={…}>
          <article>
            <h2>Latest</h2>
            <Suspense fallback={<p>Loading posts...</p>}>
              <LatestPosts searchParams={searchParams} />
            </Suspense>
          </article>
        </div>
      </main>
    </>
  )
}
```

Key changes:
- **`searchParams: Promise<{ page?: string }>`** — accepted as a prop,
  passed through to `<LatestPosts>` without awaiting. The page stays
  synchronous.
- **`fallback={<p>Loading posts...</p>}`** — hoisted from inside
  `LatestPosts`. Now streams from the server before the async child
  resolves.
- Everything else — class names, header, admin menu setter — unchanged.

## Pattern source

Mirrors `app/posts/[id]/page.tsx` exactly, with `searchParams`
substituted for `params`:

```tsx
// Canonical reference (post detail):
export default function PostPage({ params }: PropsOf<typeof PostPageContent>) {
  return (
    <Suspense fallback={<p data-testid="post-loader">Loading post</p>}>
      <PostPageContent params={params} />
    </Suspense>
  )
}
```

The pattern: sync page accepts a Promise prop, wraps the async child in
`<Suspense>` with a fallback, passes the Promise through without
awaiting. `PostsPage` follows the same shape with `searchParams`.

## Why the page stays non-async

Making the page async would force it to await `searchParams` before
rendering anything — blocking the static `'Round the Corner` header and
typewriter background on the data fetch. The research goal of this
project is to internalize the async-child-in-Suspense pattern as the
default. The page opts in to the pattern explicitly by staying sync and
passing the Promise through.

See [`../../decisions.md`](../../decisions.md) → "Page stays non-async;
async-child-in-Suspense pattern".

## `searchParams` as a `Promise`

In Next.js 15+ / 16, `searchParams` is typed as
`Promise<{ [key: string]: string | string[] | undefined }>`. The page
prop reflects this. `LatestPosts` awaits it — the page does not.

## Test impact

`app/posts/__tests__/posts.page.test.tsx` is rewritten. See
[`../testing-strategy.md`](../testing-strategy.md) → "PR 3 tests →
`posts.page.test.tsx`".
