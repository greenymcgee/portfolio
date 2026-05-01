import { render, screen } from '@testing-library/react'

import { AdminMenuContextWrapper } from '@/test/helpers/components'
import { renderWithProviders } from '@/test/helpers/utils'

import PostsPage from '../page'

const PROPS = { searchParams: Promise.resolve({}) }

describe('PostsPage', () => {
  it('should render the posts-page-heading', () => {
    render(<PostsPage {...PROPS} />)
    const heading = screen.getByTestId('posts-page-heading')
    expect(heading).toBeVisible()
    expect(heading.tagName).toBe('H1')
  })

  it('should render the Suspense fallback while LatestPosts loads', () => {
    render(<PostsPage {...PROPS} />)
    expect(screen.getByText(/Loading posts/)).toBeVisible()
  })

  it('should render the admin menu', () => {
    renderWithProviders(<PostsPage {...PROPS} />, {
      wrapper: AdminMenuContextWrapper,
    })
    expect(screen.getByTestId('posts-admin-menu-content')).toBeVisible()
  })
})
