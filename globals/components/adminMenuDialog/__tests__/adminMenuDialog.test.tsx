import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
  getApiUrl,
  mockCookieHeader,
  renderWithProviders,
} from '@/test/helpers/utils'
import { mockRootLayoutAuthSession, rootLayoutServer } from '@/test/servers'

import { AdminMenuDialog } from '..'

beforeAll(() => rootLayoutServer.listen())

beforeEach(async () => {
  await mockCookieHeader()
})

afterEach(() => {
  rootLayoutServer.resetHandlers()
  vi.useRealTimers()
})

afterAll(() => rootLayoutServer.close())

const PROPS: PropsOf<typeof AdminMenuDialog> = { content: <p>Children</p> }

describe('<AdminMenuDialog />', () => {
  it('should not render for an unauthenticated user', async () => {
    mockRootLayoutAuthSession({ signedIn: false })
    renderWithProviders(<AdminMenuDialog {...PROPS} />, {
      includesSession: true,
    })
    expect(await screen.findByText('unauthenticated')).toBeVisible()
  })

  it('should not render for a non-admin user', async () => {
    mockRootLayoutAuthSession({ role: 'USER' })
    renderWithProviders(<AdminMenuDialog {...PROPS} />, {
      includesSession: true,
    })
    expect(await screen.findByText('authenticated')).toBeVisible()
  })

  it('should render for an admin user', async () => {
    mockRootLayoutAuthSession({ role: 'ADMIN' })
    renderWithProviders(<AdminMenuDialog {...PROPS} />, {
      includesSession: true,
    })
    expect(await screen.findByTestId('admin-menu-toggle')).toBeVisible()
  })

  describe('event handlers', () => {
    it('should set aria-expanded to true after pointer enter', async () => {
      renderWithProviders(<AdminMenuDialog {...PROPS} />, {
        includesSession: true,
      })
      const toggle = await screen.findByTestId('admin-menu-toggle')
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      vi.useFakeTimers()
      fireEvent.pointerEnter(toggle)
      act(() => {
        vi.advanceTimersByTime(10)
      })
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })

    it('should set aria-expanded to false after pointer leave', async () => {
      renderWithProviders(<AdminMenuDialog {...PROPS} />, {
        includesSession: true,
      })
      const toggle = await screen.findByTestId('admin-menu-toggle')
      vi.useFakeTimers()
      fireEvent.pointerEnter(toggle)
      act(() => {
        vi.advanceTimersByTime(10)
      })
      fireEvent.pointerLeave(toggle)
      act(() => {
        vi.advanceTimersByTime(50)
      })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('should post to the Next-Auth sign-out route when Sign Out is clicked', async () => {
      renderWithProviders(<AdminMenuDialog {...PROPS} />, {
        includesSession: true,
      })
      await screen.findByTestId('admin-menu-toggle')
      fireEvent.click(screen.getByText('Sign Out'))
      await waitFor(() =>
        expect(screen.queryByTestId('sign-out-loader')).not.toBeInTheDocument(),
      )
    })

    it('should show an error message when the sign-out request fails', async () => {
      rootLayoutServer.use(
        http.post(getApiUrl('authSignout'), () => HttpResponse.error()),
      )
      renderWithProviders(<AdminMenuDialog {...PROPS} />, {
        includesSession: true,
      })
      await screen.findByTestId('admin-menu-toggle')
      fireEvent.click(screen.getByText('Sign Out'))
      expect(await screen.findByTestId('sign-out-error')).toBeInTheDocument()
    })
  })
})
