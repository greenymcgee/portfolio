import { render, screen } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { ROUTES } from '@/globals/constants'
import { PUBLISHED_POST } from '@/test/fixtures'

import { ClientSiteNavbar } from '..'

describe('<ClientSiteNavbar />', () => {
  it('should render the SiteNavbar with the pathname', () => {
    mockRouter.pathname = ROUTES.post(PUBLISHED_POST.id)
    render(<ClientSiteNavbar />)
    expect(screen.getByTestId('active-posts-link')).toBeVisible()
  })
})
