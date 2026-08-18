import { render, screen } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { ROUTES } from '@/globals/constants'

import { ClientSiteNavbar } from '..'

describe('<ClientSiteNavbar />', () => {
  it('should render the SiteNavbar', () => {
    mockRouter.pathname = ROUTES.posts
    vi.stubEnv('NEXT_PUBLIC_BLOG_FEATURE', 'true')
    render(<ClientSiteNavbar />)
    expect(screen.getByTestId('active-posts-link')).toBeVisible()
  })
})
