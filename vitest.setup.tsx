import React from 'react'

// import { createDynamicRouteParser } from 'next-router-mock/dynamic-routes'
import '@testing-library/jest-dom'

vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual('next-auth/react')
  return { ...actual, signIn: vi.fn() }
})

vi.mock('next/cache', async () => {
  const cache = await vi.importActual('next/cache')
  return {
    ...cache,
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
  }
})

vi.mock('next/headers', () => {
  const deleteCookie = vi.fn()
  const get = vi.fn()
  const set = vi.fn()
  const headersGet = vi.fn()
  return {
    cookies: vi
      .fn()
      .mockImplementation(() => ({ delete: deleteCookie, get, set })),
    headers: vi.fn().mockImplementation(() => ({ get: headersGet })),
  }
})

vi.mock('next/navigation', async () => {
  const mockRouter = await vi.importActual('next-router-mock')
  // mockRouter.useParser(createDynamicRouteParser(['/reset-password/[token]']))
  return {
    redirect: vi
      .fn()
      // @ts-expect-error: just need simple implementation
      .mockImplementation((pathname: string) => mockRouter.push(pathname)),
    useParams: () => mockRouter.query,
    usePathname: () => mockRouter.pathname,
    useRouter: () => ({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ...mockRouter.useRouter(),
      // refresh doesn't exist for the pages router, so we need it.
      refresh: vi.fn(),
    }),
    useSearchParams: vi
      .fn()
      .mockImplementation(
        () => new URLSearchParams(mockRouter.query as Record<string, string>),
      ),
  }
})

// https://github.com/vercel/next.js/discussions/60125#discussioncomment-9653211
vi.mock('next/link', () => {
  interface Props {
    children: React.ReactNode
    href: string
    onClick: () => void
  }
  function mockLink({ children, href, onClick, ...options }: Props) {
    return (
      <a
        href={href}
        onClick={(event) => {
          event.preventDefault()
          onClick()
        }}
        {...options}
      >
        {children}
      </a>
    )
  }
  mockLink.displayName = 'Link'
  return { default: mockLink }
})

vi.mock('@/lib/logger.ts', async () => {
  const { logger } = await vi.importActual('@/lib/logger.ts')
  return {
    logger: {
      ...(logger as Record<string, unknown>),
      error: vi.fn(),
      info: vi.fn(),
    },
  }
})

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
beforeAll(() => {
  if (typeof window === 'undefined') return

  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation((query) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(), // deprecated
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(), // deprecated
    })),
    writable: true,
  })
})

beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') return

  HTMLDialogElement.prototype.show = vi.fn(function mock(
    this: HTMLDialogElement,
  ) {
    this.open = true
  })

  HTMLDialogElement.prototype.showModal = vi.fn(function mock(
    this: HTMLDialogElement,
  ) {
    this.open = true
  })

  HTMLDialogElement.prototype.close = vi.fn(function mock(
    this: HTMLDialogElement,
  ) {
    this.open = false
  })
})

/**
 * Use mockUserServerSession and mockUserServerSessionAsync.
 *
 * @example
 * import { mockUserServerSessionAsync } from '@test/helpers/utils'
 *
 * // mocks the logged in admin user and returns the generated token
 * const token = await mockUserServerSessionAsync('ADMIN')
 */
vi.mock('next-auth/jwt', async () => {
  const nextAuth = await vi.importActual('next-auth/jwt')
  return {
    ...nextAuth,
    getToken: vi.fn().mockImplementation(() => undefined),
  }
})
