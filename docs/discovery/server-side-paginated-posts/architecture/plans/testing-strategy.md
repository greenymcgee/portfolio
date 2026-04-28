# Testing Strategy — server-side-paginated-posts

> Part of [server-side-paginated-posts architecture](./README.md).
> Source slice: [architecture.md](../architecture.md) §6.15.

All tests follow `.cursor/rules/VITEST_RULES.mdc`: factories from
`@/test/factories`, fixtures from `@/test/fixtures`, `it("should …")`
phrasing, ≤ 2 expects per `it`, no `mock`-prefixed names, no className
selectors, label-driven element selection.

## Overview by PR

| PR | New | Rewritten | Changed | Deleted |
| --- | --- | --- | --- | --- |
| 1 | 7 primitive test files | — | `globals/components/ui/index.ts` (indirect) | — |
| 2 | `getPaginatedPosts.db.test.ts` | — | `find-and-count-posts.dto.test.ts`, `deletePost.db.test.ts`, `GET.db.test.ts` | — |
| 3 | `pagination.test.tsx` (wrapper), conditional `getTruncatedPageList.test.ts` | `posts.page.test.tsx`, `latestPosts.test.tsx` | — | `useGetPaginatedPostsQuery.test.ts` |
| 4 | — | — | `postsServer.ts` (GET handler + helper removed) | `GET.db.test.ts` |

---

## PR 1 tests — pagination primitives

One test file per component, co-located in each component's `__tests__/`
directory. All are smoke tests — render correctness + ARIA defaults.
Behavior coverage lives in PR 3's feature-wrapper test.

### `pagination.test.tsx`

| `it` | Assertion |
| --- | --- |
| should render a `<nav>` element | `getByRole('navigation')` present |
| should default `aria-label` to `"pagination"` | `getByRole('navigation', { name: 'pagination' })` |
| should accept a custom `aria-label` | `<Pagination aria-label="Posts pagination" />` → `getByRole('navigation', { name: 'Posts pagination' })` |

### `paginationContent.test.tsx`

| `it` | Assertion |
| --- | --- |
| should render a `<ul>` element | `getByRole('list')` present |
| should have `data-slot="pagination-content"` | attribute present on the list element |

### `paginationItem.test.tsx`

| `it` | Assertion |
| --- | --- |
| should render an `<li>` element | `getByRole('listitem')` present |
| should have `data-slot="pagination-item"` | attribute present |

### `paginationLink.test.tsx`

| `it` | Assertion |
| --- | --- |
| should render with `isActive={true}` → `aria-current="page"` | `getByRole('link').getAttribute('aria-current')` is `'page'` |
| should render with `isActive={false}` (default) → no `aria-current` | `getByRole('link').hasAttribute('aria-current')` is `false` |
| should forward `href` to the underlying element | `getByRole('link').getAttribute('href')` matches prop |

### `paginationPrevious.test.tsx`

| `it` | Assertion |
| --- | --- |
| should have `aria-label="Go to previous page"` | `getByRole('link', { name: /go to previous page/i })` present |
| should render the visible "Previous" text | `getByText(/Previous/)` present |
| should render the `ChevronLeft` icon | icon element present in DOM |

### `paginationNext.test.tsx`

| `it` | Assertion |
| --- | --- |
| should have `aria-label="Go to next page"` | `getByRole('link', { name: /go to next page/i })` present |
| should render the visible "Next" text | `getByText(/Next/)` present |
| should render the `ChevronRight` icon | icon element present in DOM |

### `paginationEllipsis.test.tsx`

| `it` | Assertion |
| --- | --- |
| should be `aria-hidden="true"` | container element has `aria-hidden="true"` |
| should include SR-only "More pages" text | SR-only element with text "More pages" present |
| should render the `MoreHorizontal` icon | icon element present in DOM |

---

## PR 2 tests — backend additive

### `getPaginatedPosts.db.test.ts` (new)

Mirrors `features/posts/actions/__tests__/getPost.db.test.ts` shape.

```typescript
let findAndCountSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  findAndCountSpy = vi.spyOn(PostService, 'findAndCount')
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

| Branch | Setup | Assertion |
| --- | --- | --- |
| Success | Spy returns `okAsync({ posts, totalPages, status: SUCCESS })` | Returns `{ error: null, posts, totalPages }` |
| Entity error | Spy returns `errAsync({ type: 'entity', ... })` | Returns `{ error, posts: [], totalPages: 0 }` |
| Unhandled error type | Spy returns unknown error type | `logger.error` called with `UNHANDLED_FIND_AND_COUNT_POSTS_ERROR`; returns `{ error, posts: [], totalPages: 0 }` |
| Integration (real DB) | `setupTestDatabase({ withPosts: true, withUsers: true })` | `getPaginatedPosts({ page: '0' })` returns `posts.length > 0`, `totalPages >= 1`, `currentPage: 0`, `error: null` |

### `find-and-count-posts.dto.test.ts` (changed)

Drop all `Request`-based test cases. Replace with primitives-constructor cases.

| `it` | Setup | Assertion |
| --- | --- | --- |
| should return `{ limit, offset }` for valid inputs | `new FindAndCountPostsDto({ page: '1' }).params` | Returns `{ limit: 10, offset: 10 }` |
| should return a `ZodError` for invalid inputs | `new FindAndCountPostsDto({ page: '-1' }).params` | Returns `expect.any(ZodError)` |
| should default page to 0 when absent | `new FindAndCountPostsDto({}).params` | Returns `{ limit: 10, offset: 0 }` |

### `deletePost.db.test.ts` (changed)

Update the success-branch assertion from `revalidatePath` to `revalidateTag`.
`vitest.setup.tsx:16` already mocks `revalidateTag` — no new setup needed.

| Change | Before | After |
| --- | --- | --- |
| Success branch assertion | `expect(revalidatePath).toHaveBeenCalledWith(ROUTES.posts)` | `expect(revalidateTag).toHaveBeenCalledWith('posts')` |
| Remove | `expect(revalidatePath).toHaveBeenCalledWith(ROUTES.post(id))` | (deleted) |

### `GET.db.test.ts` (changed)

Update for the primitives-constructor DTO shape. The handler now reads
`searchParams` itself and passes primitives. Stays in PR 2; deleted in PR 4.

---

## PR 3 tests — frontend cutover

### `posts.page.test.tsx` (rewritten)

Replace the msw `mockGetPostsResponse` approach with
`vi.spyOn(PostService, 'findAndCount')`. The page test is an RTL render
test — the integration coverage lives in `getPaginatedPosts.db.test.ts`.

| `it` | Setup | Assertion |
| --- | --- | --- |
| should render the `posts-page-heading` | `render(<PostsPage searchParams={Promise.resolve({})} />)` | `getByTestId('posts-page-heading')` present |
| should render the Suspense fallback before resolution | Spy deferred (pending promise) | `getByText(/Loading posts/)` present |
| should render post cards once resolved | Spy returns success with posts | `findByTestId('card-…')` elements present |
| should render the pagination control | Spy returns `totalPages: 3` | Pagination nav present |
| should render the error branch | Spy returns entity error | `findByTestId('latest-posts-error')` present |

### `latestPosts.test.tsx` (rewritten)

Replace msw approach with `vi.spyOn(PostService, 'findAndCount')`.

```typescript
// Render pattern for async RSC in tests:
await act(() =>
  render(<LatestPosts searchParams={Promise.resolve({ page: '0' })} />)
)
```

| `it` | Spy setup | Assertion |
| --- | --- | --- |
| should render post card links | Success with posts | `getByRole('link', { name: post.title })` present for each post |
| should render the empty-state message when posts is empty | `posts: [], totalPages: 0` | `getByTestId('latest-posts-empty')` present |
| should render the error message on failure | Entity error | `getByTestId('latest-posts-error')` present |
| should render pagination when `totalPages > 1` | `totalPages: 3` | Pagination nav present |
| should not render pagination when `totalPages === 1` | `totalPages: 1` | Pagination nav absent |

### `useGetPaginatedPostsQuery.test.ts` (deleted)

The hook is deleted in PR 3. The test file goes with it.

### `pagination.test.tsx` — feature wrapper (new)

`features/posts/components/pagination/__tests__/pagination.test.tsx`.
Covers the public contract of `<Pagination currentPage totalPages />`.

| `it` | Props | Assertion |
| --- | --- | --- |
| should render nothing when `totalPages <= 1` | `{ currentPage: 0, totalPages: 1 }` | No `<nav>` in the DOM |
| should render nothing when `totalPages === 0` | `{ currentPage: 0, totalPages: 0 }` | No `<nav>` in the DOM |
| should render a link per page with correct hrefs | `{ currentPage: 0, totalPages: 3 }` | `getByRole('link', { name: '1' })` href is `/posts?page=0`, etc. |
| should mark the active page with `aria-current="page"` | `{ currentPage: 1, totalPages: 3 }` | Page-2 link has `aria-current="page"` |
| should disable Previous at `currentPage === 0` | `{ currentPage: 0, totalPages: 3 }` | Previous link has `aria-disabled="true"` |
| should disable Next at last page | `{ currentPage: 2, totalPages: 3 }` | Next link has `aria-disabled="true"` |
| should render ellipsis for large page sets | `{ currentPage: 4, totalPages: 10 }` | SR-only "More pages" elements present |

Full truncation-table coverage from
[`../architecture.md`](../architecture.md) → "Page-list truncation
rule":

| Input | Rendered page list |
| --- | --- |
| `(currentPage=0, totalPages=2)` | `[1, 2]` |
| `(currentPage=0, totalPages=5)` | `[1, 2, 3, 4, 5]` |
| `(currentPage=0, totalPages=10)` | `[1, 2, 3, …, 10]` |
| `(currentPage=4, totalPages=10)` | `[1, …, 4, 5, 6, …, 10]` |
| `(currentPage=9, totalPages=10)` | `[1, …, 8, 9, 10]` |

If truncation logic is extracted to `getTruncatedPageList.ts`, these
assertions move to `getTruncatedPageList.test.ts` (pure-function tests)
and the wrapper test keeps only the boundary (disabled/enabled controls)
and ARIA assertions.

---

## PR 4 tests — backend cleanup

### `GET.db.test.ts` (deleted)

Removed alongside the GET handler.

### `postsServer.ts` (changed)

- Delete the `http.get(getApiUrl('posts'), …)` handler from the
  `handlers` array.
- Delete the `mockGetPostsResponse` export.
- Verify `mockPostsCreateResponse` and the `postsServer` export survive.

---

## What NOT to test

- **Cache-tag invalidation E2E.** Verifying `revalidateTag('posts')`
  actually invalidates a `'use cache'` entry requires a running Next.js
  server. `vitest.setup.tsx` mocks `revalidateTag` to `vi.fn` — we can
  assert the *call*, not the *effect*. If runtime confidence is needed
  later, add a Playwright "delete a post on page 2, navigate back,
  verify it's gone" flow.
- **`'use cache'` directive behavior inside Vitest.** Vitest doesn't
  run the `cacheComponents` pipeline. Tests assert the function's return
  shape, not whether the cache layer activated.
