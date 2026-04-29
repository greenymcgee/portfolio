import { render, screen } from '@testing-library/react'

import { PaginationNext } from '..'

const PROPS: PropsOf<typeof PaginationNext> = {
  href: '/posts?page=1',
}

describe('<PaginationNext />', () => {
  it('should have aria-label="Go to next page"', () => {
    render(<PaginationNext {...PROPS} />)
    expect(
      screen.getByRole('link', { name: /go to next page/i }),
    ).toBeVisible()
  })

  it('should render the visible "Next" text', () => {
    render(<PaginationNext {...PROPS} />)
    expect(screen.getByText(/Next/)).toBeVisible()
  })

  it('should render the ChevronRight icon', () => {
    const { container } = render(<PaginationNext {...PROPS} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
