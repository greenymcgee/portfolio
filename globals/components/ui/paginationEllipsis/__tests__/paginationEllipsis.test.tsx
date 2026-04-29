import { render, screen } from '@testing-library/react'

import { PaginationEllipsis } from '..'

describe('<PaginationEllipsis />', () => {
  it('should include SR-only "More pages" text', () => {
    render(<PaginationEllipsis />)
    expect(screen.getByText('More pages')).toBeInTheDocument()
  })

  it('should render the MoreHorizontal icon', () => {
    const { container } = render(<PaginationEllipsis />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
