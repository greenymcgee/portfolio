import { render, screen } from '@testing-library/react'

import { PaginationPrevious } from '..'

const PROPS: PropsOf<typeof PaginationPrevious> = {
  href: '/posts?page=0',
}

describe('<PaginationPrevious />', () => {
  it('should have aria-label="Go to previous page"', () => {
    render(<PaginationPrevious {...PROPS} />)
    expect(
      screen.getByRole('link', { name: /go to previous page/i }),
    ).toBeVisible()
  })

  it('should render the visible "Previous" text', () => {
    render(<PaginationPrevious {...PROPS} />)
    expect(screen.getByText(/Previous/)).toBeVisible()
  })

  it('should render the ChevronLeft icon', () => {
    const { container } = render(<PaginationPrevious {...PROPS} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
