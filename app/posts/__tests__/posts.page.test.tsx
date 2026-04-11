import { act, render, screen } from '@testing-library/react'

import { AdminMenuContextWrapper } from '@/test/helpers/components'
import { renderWithProviders } from '@/test/helpers/utils'
import { postsServer } from '@/test/servers'

import PostsPage from '../page'

beforeAll(() => postsServer.listen())
afterEach(() => postsServer.resetHandlers())
afterAll(() => postsServer.close())

describe('PostsPage', () => {
  it('should render an h1', async () => {
    await act(() => render(<PostsPage />))
    expect(screen.getByTestId('posts-page-heading').tagName).toBe('H1')
  })

  it('should render the latest posts', async () => {
    await act(() => render(<PostsPage />))
    expect(screen.getByTestId('latest-posts')).toBeVisible()
  })

  it('should render the admin menu', async () => {
    await act(() => {
      renderWithProviders(<PostsPage />, { wrapper: AdminMenuContextWrapper })
    })
    expect(screen.getByTestId('posts-admin-menu-content')).toBeVisible()
  })
})
