import { screen } from '@testing-library/react'

import { ROUTES } from '@/globals/constants'
import { PUBLISHED_POST } from '@/test/fixtures'
import { renderWithProviders } from '@/test/helpers/utils'

import { SiteNavbar } from '..'

const PROPS: PropsOf<typeof SiteNavbar> = { pathname: ROUTES.home }

describe('<SiteNavbar />', () => {
  it('should not render when the pathname is not / or /posts', () => {
    const { container } = renderWithProviders(
      <SiteNavbar pathname={ROUTES.post(PUBLISHED_POST.id)} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('should render for the /posts page', () => {
    renderWithProviders(<SiteNavbar pathname={ROUTES.posts} />)
    expect(screen.getByTestId('site-navbar')).toBeVisible()
  })

  it('should render for the home page', () => {
    renderWithProviders(<SiteNavbar {...PROPS} />)
    expect(screen.getByTestId('site-navbar')).toBeVisible()
  })
})
