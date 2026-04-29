import { render, screen } from '@testing-library/react'

import { PaginationItem } from '..'

describe('<PaginationItem />', () => {
  it('should render a listitem element', () => {
    render(
      <ul>
        <PaginationItem />
      </ul>,
    )
    expect(screen.getByRole('listitem')).toBeVisible()
  })

  it('should have data-slot="pagination-item"', () => {
    render(
      <ul>
        <PaginationItem />
      </ul>,
    )
    expect(screen.getByRole('listitem')).toHaveAttribute(
      'data-slot',
      'pagination-item',
    )
  })
})
