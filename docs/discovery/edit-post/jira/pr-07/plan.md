# Edit Post PR-07 — Core Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the core edit page route, data-fetching RSC, client shell, and autosave wiring for the edit post feature.

**Architecture:** A sync RSC page (`page.tsx`) wraps an async RSC (`EditPostContent`) in Suspense — the same pattern as `/posts/[id]`. `EditPostContent` fetches the post and passes it to `EditPostClient`, a `'use client'` component that owns all mutable form state and a 1-second debounce autosave via `useActionState`. No visible UI beyond the title input and inline save state scaffolding — those are extracted in PRs 8 and 9.

**Tech Stack:** Next.js 15 App Router, React `useActionState`, `useSession` (next-auth), neverthrow, Vitest + RTL, Zod

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Modified | `globals/constants/routes.ts` | Add `editPost` route constant |
| Created | `app/posts/[id]/edit/page.tsx` | Sync RSC, Suspense boundary only |
| Created | `app/posts/[id]/edit/__tests__/page.test.tsx` | Page Suspense fallback test |
| Created | `features/posts/components/editPostContent/editPostContent.tsx` | Async RSC, calls `getPost`, passes post to client |
| Created | `features/posts/components/editPostContent/index.ts` | Barrel export |
| Created | `features/posts/components/editPostClient/editPostClient.tsx` | Client shell — form state, auth guard, autosave |
| Created | `features/posts/components/editPostClient/__tests__/editPostClient.test.tsx` | Client component tests |
| Created | `features/posts/components/editPostClient/index.ts` | Barrel export |
| Modified | `features/posts/components/index.ts` | Re-export `EditPostContent` and `EditPostClient` |

---

## Task 1: Add `ROUTES.editPost`

**Files:**
- Modify: `globals/constants/routes.ts`

- [ ] **Step 1: Add the route constant**

```ts
// globals/constants/routes.ts
export const ROUTES = {
  editPost: (id: number) => `/posts/${id}/edit`,
  home: '/',
  login: '/login',
  loginWithRedirect: (pathname: string) => `/login?redirect=${pathname}`,
  newPost: '/posts/new',
  newUser: '/users/new',
  post: (id: number) => `/posts/${id}`,
  posts: '/posts',
  register: '/register',
  unpublishedPosts: '/posts?unpublished=true',
} as const
```

- [ ] **Step 2: Verify types**

```bash
pnpm tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add globals/constants/routes.ts
git commit -m "#170 Adds ROUTES.editPost constant"
```

---

## Task 2: `page.tsx` (TDD)

**Files:**
- Create: `app/posts/[id]/edit/__tests__/page.test.tsx`
- Create: `app/posts/[id]/edit/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// app/posts/[id]/edit/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react'

import { AUTHORED_POST } from '@/test/fixtures'

import EditPostPage from '../page'

const neverResolvingPromise = vi.hoisted(() => new Promise<never>(() => {}))

vi.mock('@/features/posts/components', async () => {
  const actual = await vi.importActual('@/features/posts/components')
  return {
    ...actual,
    EditPostContent: () => {
      throw neverResolvingPromise
    },
  }
})

const PROPS: PropsOf<typeof EditPostPage> = {
  params: Promise.resolve({ id: AUTHORED_POST.id }),
}

describe('<EditPostPage />', () => {
  it('should render the edit post loader', () => {
    render(<EditPostPage {...PROPS} />)
    expect(screen.getByTestId('edit-post-loader')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
pnpm test app/posts/\\[id\\]/edit/__tests__/page.test.tsx
```

Expected: FAIL — `EditPostPage` does not exist yet.

- [ ] **Step 3: Implement `page.tsx`**

```tsx
// app/posts/[id]/edit/page.tsx
import { Suspense } from 'react'

import { EditPostContent } from '@/features/posts/components'

export default function EditPostPage({
  params,
}: PropsOf<typeof EditPostContent>) {
  return (
    <Suspense fallback={<p data-testid="edit-post-loader">Loading post</p>}>
      <EditPostContent params={params} />
    </Suspense>
  )
}
```

- [ ] **Step 4: Run the test and confirm it passes**

```bash
pnpm test app/posts/\\[id\\]/edit/__tests__/page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/posts/\\[id\\]/edit/
git commit -m "#170 Adds edit post page.tsx with Suspense boundary"
```

---

## Task 3: `EditPostContent`

No test for this component — `EditPostContent` is a thin data-fetching shell; any meaningful behaviour is covered by `EditPostClient` tests. Revisit if that assumption breaks.

**Files:**
- Create: `features/posts/components/editPostContent/editPostContent.tsx`
- Create: `features/posts/components/editPostContent/index.ts`
- Modify: `features/posts/components/index.ts`

- [ ] **Step 1: Implement `EditPostContent`**

```tsx
// features/posts/components/editPostContent/editPostContent.tsx
import { getPost } from '../../actions'
import { EditPostClient } from '../editPostClient'

type Props = { params: Promise<{ id: number }> }

export async function EditPostContent({ params }: Props) {
  const { id } = await params
  const { post } = await getPost(id)
  return <EditPostClient post={post} />
}
```

- [ ] **Step 2: Create the barrel export**

```ts
// features/posts/components/editPostContent/index.ts
export * from './editPostContent'
```

- [ ] **Step 3: Add to feature barrel**

```ts
// features/posts/components/index.ts
export * from './createPostForm'
export * from './editPostContent'
export * from './latestPosts'
export * from './postPageAdminMenuContent'
export * from './postPageContent'
export * from './postsPageAdminMenuContent'
```

- [ ] **Step 4: Verify types**

```bash
pnpm tsc
```

Expected: no errors. (`EditPostClient` does not exist yet — TypeScript will error. Proceed to Task 4 before committing.)

---

## Task 4: `EditPostClient` — scaffold + auth guard (TDD)

**Files:**
- Create: `features/posts/components/editPostClient/__tests__/editPostClient.test.tsx`
- Create: `features/posts/components/editPostClient/editPostClient.tsx`
- Create: `features/posts/components/editPostClient/index.ts`

- [ ] **Step 1: Write the failing tests**

```tsx
// features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
import { screen, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { ROUTES } from '@/globals/constants'
import { AUTHORED_POST } from '@/test/fixtures'
import {
  mockAuthSessionResponse,
  mockServerSession,
  renderWithProviders,
} from '@/test/helpers/utils'
import { postsServer } from '@/test/servers'

import { EditPostClient } from '..'

beforeEach(() => {
  mockRouter.push(ROUTES.editPost(AUTHORED_POST.id))
})
beforeAll(() => postsServer.listen())
afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
  postsServer.resetHandlers()
})
afterAll(() => postsServer.close())

const PROPS: PropsOf<typeof EditPostClient> = {
  post: AUTHORED_POST,
}

describe('<EditPostClient />', () => {
  it('should render the title input', () => {
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
    expect(screen.getByTestId('title-input')).toBeVisible()
  })

  it('should redirect an unauthorized user to home', async () => {
    mockAuthSessionResponse(postsServer, { role: 'USER' })
    renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
    await waitFor(() => expect(mockRouter.pathname).toBe(ROUTES.home))
  })
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: FAIL — `EditPostClient` does not exist yet.

- [ ] **Step 3: Implement `EditPostClient` with auth guard and minimal form**

```tsx
// features/posts/components/editPostClient/editPostClient.tsx
'use client'

import {
  useActionState,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { updatePost } from '@/features/posts/actions'
import { ROUTES } from '@/globals/constants'
import { hasPermission } from '@/lib/permissions'
import type { Post } from '@/prisma/generated/client'

import type { UpdatePostState } from '../../types'

interface Props {
  post: Post | null
}

const INITIAL_STATE: UpdatePostState = { status: 'IDLE' }

export function EditPostClient({ post }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState(post?.title ?? '')
  const [description] = useState(post?.description ?? '')
  const [content] = useState(
    typeof post?.content === 'string' ? post.content : '',
  )
  const formRef = useRef<HTMLFormElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [state, updateAction, pending] = useActionState(updatePost, INITIAL_STATE)
  const permitted = useMemo(
    () => hasPermission(session?.user, 'posts', 'update'),
    [session?.user],
  )

  useLayoutEffect(() => {
    if (permitted || status === 'loading' || pathname === ROUTES.home) return
    router.push(ROUTES.home)
  }, [pathname, permitted, router, status])

  const cancelDebounce = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  // flushDebounce is added in PR-10 when the Close button needs it.
  // Defining it unused here would fail the zero-warnings lint policy.

  const handleFieldChange = () => {
    cancelDebounce()
    timeoutRef.current = setTimeout(() => {
      if (formRef.current) updateAction(new FormData(formRef.current))
    }, 1000)
  }

  return (
    <>
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <input type="hidden" name="id" value={post?.id ?? ''} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="content" value={content} />
        <div>
          <input
            data-testid="title-input"
            name="title"
            onChange={(e) => {
              setTitle(e.target.value)
              handleFieldChange()
            }}
            type="text"
            value={title}
          />
        </div>
      </form>
    </>
  )
}
```

- [ ] **Step 4: Create the barrel export**

```ts
// features/posts/components/editPostClient/index.ts
export * from './editPostClient'
```

- [ ] **Step 5: Add `EditPostClient` to the feature barrel**

```ts
// features/posts/components/index.ts
export * from './createPostForm'
export * from './editPostContent'
export * from './editPostClient'
export * from './latestPosts'
export * from './postPageAdminMenuContent'
export * from './postPageContent'
export * from './postsPageAdminMenuContent'
```

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add features/posts/components/editPostContent/ features/posts/components/editPostClient/ features/posts/components/index.ts
git commit -m "#170 Adds EditPostContent and EditPostClient with auth guard"
```

---

## Task 5: `EditPostClient` — autosave debounce (TDD)

**Files:**
- Modify: `features/posts/components/editPostClient/__tests__/editPostClient.test.tsx`
- (No component changes needed — the debounce is already wired in Task 4)

- [ ] **Step 1: Add the failing debounce tests**

Add these two `it` blocks inside the existing `describe('<EditPostClient />', ...)`:

```tsx
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { PostRepository } from '@/features/posts/post.repository'
import { UNPUBLISHED_POST } from '@/test/fixtures'

// (add these inside the existing describe block)

it('should fire autosave after a 1-second debounce', async () => {
  vi.useFakeTimers()
  vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(UNPUBLISHED_POST)
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'updated title' },
  })
  expect(PostRepository.update).not.toHaveBeenCalled()
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect(PostRepository.update).toHaveBeenCalledOnce()
  vi.useRealTimers()
})

it('should reset the debounce timer when the field changes again before 1 second', async () => {
  vi.useFakeTimers()
  vi.spyOn(PostRepository, 'update').mockResolvedValue(UNPUBLISHED_POST)
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'first change' },
  })
  await act(() => vi.advanceTimersByTimeAsync(500))
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'second change' },
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect(PostRepository.update).toHaveBeenCalledOnce()
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: the two new tests FAIL (imports unresolved or assertions fail). The two existing tests continue to PASS.

- [ ] **Step 3: Verify the implementation already handles this**

The debounce is already implemented in Task 4 (`cancelDebounce` + `setTimeout` in `handleFieldChange`). Re-run to confirm:

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: all four tests PASS. If either debounce test still fails, check that:
- `vi.useFakeTimers()` is called before render
- `await act(() => vi.advanceTimersByTimeAsync(1000))` is awaited
- `vi.useRealTimers()` is called after assertions

- [ ] **Step 4: Commit**

```bash
git add features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
git commit -m "#170 Adds autosave debounce tests to EditPostClient"
```

---

## Task 6: `EditPostClient` — save state display (TDD)

**Files:**
- Modify: `features/posts/components/editPostClient/__tests__/editPostClient.test.tsx`
- Modify: `features/posts/components/editPostClient/editPostClient.tsx`

- [ ] **Step 1: Add the failing save state tests**

Add these four `it` blocks inside the existing `describe`:

```tsx
import { act, fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'

it('should show nothing in idle state', () => {
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.queryByText('Saved')).not.toBeInTheDocument()
})

it('should show a spinner while autosave is in progress', async () => {
  vi.useFakeTimers()
  vi.spyOn(PostRepository, 'update').mockReturnValueOnce(new Promise(() => {}))
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'updated title' },
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect(screen.getByRole('status')).toBeVisible()
  vi.useRealTimers()
})

it('should show "Saved" after a successful autosave', async () => {
  vi.useFakeTimers()
  vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(UNPUBLISHED_POST)
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'updated title' },
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  await waitForElementToBeRemoved(screen.getByRole('status'))
  expect(screen.getByText('Saved')).toBeVisible()
  vi.useRealTimers()
})

it('should show an error message after a failed autosave', async () => {
  vi.useFakeTimers()
  vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(new Error('Server error'))
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'updated title' },
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  await waitForElementToBeRemoved(screen.getByRole('status'))
  expect(screen.getByTestId('save-error')).toBeVisible()
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run the tests and confirm the new ones fail**

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: the four new tests FAIL. The existing four tests continue to PASS.

- [ ] **Step 3: Add save state display to `EditPostClient`**

Replace the `return` statement in `editPostClient.tsx`:

```tsx
return (
  <>
    {pending && <span role="status">Saving</span>}
    {!pending && state.status === 'SUCCESS' && <span>Saved</span>}
    {!pending && state.status === 'ERROR' && (
      <span data-testid="save-error">Failed to save</span>
    )}
    <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <input type="hidden" name="id" value={post?.id ?? ''} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="content" value={content} />
      <div>
        <input
          data-testid="title-input"
          name="title"
          onChange={(e) => {
            setTitle(e.target.value)
            handleFieldChange()
          }}
          type="text"
          value={title}
        />
      </div>
    </form>
  </>
)
```

- [ ] **Step 4: Run the tests and confirm they all pass**

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: all eight tests PASS.

- [ ] **Step 5: Commit**

```bash
git add features/posts/components/editPostClient/
git commit -m "#170 Adds save state display to EditPostClient"
```

---

## Task 7: `EditPostClient` — error display (TDD)

**Files:**
- Modify: `features/posts/components/editPostClient/__tests__/editPostClient.test.tsx`
- Modify: `features/posts/components/editPostClient/editPostClient.tsx`

- [ ] **Step 1: Add the failing error display tests**

Add these imports at the top of the test file:

```tsx
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { z } from 'zod'

import { PrismaError } from '@/lib/errors'
```

Add these two `it` blocks inside the existing `describe`:

```tsx
it('should show an inline error near the title input on a unique constraint failure', async () => {
  vi.useFakeTimers()
  const prismaError = new PrismaError(
    new PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`title`)',
      { clientVersion: '5.0.0', code: 'P2002' },
    ),
  )
  vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(prismaError)
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'duplicate title' },
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  await waitForElementToBeRemoved(screen.getByRole('status'))
  expect(screen.getByTestId('title-error')).toBeVisible()
  vi.useRealTimers()
})

it('should show an inline error near the editor when content fails DTO validation', async () => {
  vi.useFakeTimers()
  const { error: zodError } = z
    .object({ content: z.string().min(10_000) })
    .safeParse({ content: '' })
  vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(zodError!)
  mockServerSession('ADMIN')
  renderWithProviders(<EditPostClient {...PROPS} />, { includesSession: true })
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'updated title' },
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  await waitForElementToBeRemoved(screen.getByRole('status'))
  expect(screen.getByTestId('content-error')).toBeVisible()
  vi.useRealTimers()
})
```

**Note on the content DTO test:** `PostRepository.update` returning a `ZodError` triggers `PostService.respondWithZodError` → action handles `'dto'` → `state.dtoError` is set. The ZodError is constructed with a `content` path so `flattenError` populates `fieldErrors.content`. Using `z.string().min(10_000)` guarantees the schema fails and gives a path of `['content']`.

- [ ] **Step 2: Run the tests and confirm the new ones fail**

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: the two new tests FAIL. All eight existing tests continue to PASS.

- [ ] **Step 3: Add the error display elements to `EditPostClient`**

Replace the `<div>` block that wraps the title input:

```tsx
<div>
  <input
    data-testid="title-input"
    name="title"
    onChange={(e) => {
      setTitle(e.target.value)
      handleFieldChange()
    }}
    type="text"
    value={title}
  />
  {state.threwUniqueConstraintError && (
    <p data-testid="title-error">A post with this title already exists</p>
  )}
</div>
{state.dtoError?.fieldErrors?.content && (
  <p data-testid="content-error">
    {state.dtoError.fieldErrors.content[0]}
  </p>
)}
```

The complete `return` statement should now be:

```tsx
return (
  <>
    {pending && <span role="status">Saving</span>}
    {!pending && state.status === 'SUCCESS' && <span>Saved</span>}
    {!pending && state.status === 'ERROR' && (
      <span data-testid="save-error">Failed to save</span>
    )}
    <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <input type="hidden" name="id" value={post?.id ?? ''} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="content" value={content} />
      <div>
        <input
          data-testid="title-input"
          name="title"
          onChange={(e) => {
            setTitle(e.target.value)
            handleFieldChange()
          }}
          type="text"
          value={title}
        />
        {state.threwUniqueConstraintError && (
          <p data-testid="title-error">A post with this title already exists</p>
        )}
      </div>
      {state.dtoError?.fieldErrors?.content && (
        <p data-testid="content-error">
          {state.dtoError.fieldErrors.content[0]}
        </p>
      )}
    </form>
  </>
)
```

- [ ] **Step 4: Run the tests and confirm they all pass**

```bash
pnpm test features/posts/components/editPostClient/__tests__/editPostClient.test.tsx
```

Expected: all ten tests PASS.

- [ ] **Step 5: Commit**

```bash
git add features/posts/components/editPostClient/
git commit -m "#170 Adds error display to EditPostClient"
```

---

## Task 8: Full validation

- [ ] **Step 1: Run the full validation suite**

```bash
pnpm validate
```

Expected: all checks pass — TypeScript, ESLint (zero warnings), spellcheck, and test coverage.

- [ ] **Step 2: Fix any issues**

Common things to check if validation fails:
- **ESLint sort-keys**: `ROUTES` object keys must be alphabetically sorted — `editPost` (e) goes before `home` (h), which is how Task 1 writes it
- **ESLint unused vars**: `description` and `content` state have no setters — if the linter flags them, rename as `const [description] = useState(...)` (destructured single value, no setter variable)
- **spellcheck**: add any new words to `.cspell.json` if flagged

- [ ] **Step 3: Final commit (if fixes were needed)**

```bash
git add -p
git commit -m "#170 Fixes lint and type errors from PR-07 core structure"
```
