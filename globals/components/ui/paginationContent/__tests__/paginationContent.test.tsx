import { render, screen } from '@testing-library/react'

import { PaginationContent } from '..'

describe('<PaginationContent />', () => {
  it('should render a list element', () => {
    render(<PaginationContent />)
    expect(screen.getByRole('list')).toBeVisible()
  })

  it('should have data-slot="pagination-content"', () => {
    render(<PaginationContent />)
    expect(screen.getByRole('list')).toHaveAttribute(
      'data-slot',
      'pagination-content',
    )
  })
})
