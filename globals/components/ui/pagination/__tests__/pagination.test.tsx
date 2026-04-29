import { render, screen } from '@testing-library/react'

import { Pagination } from '..'

describe('<Pagination />', () => {
  it('should render a nav element', () => {
    render(<Pagination />)
    expect(screen.getByRole('navigation')).toBeVisible()
  })

  it('should default aria-label to "pagination"', () => {
    render(<Pagination />)
    expect(screen.getByRole('navigation', { name: 'pagination' })).toBeVisible()
  })

  it('should accept a custom aria-label', () => {
    render(<Pagination aria-label="Posts pagination" />)
    expect(
      screen.getByRole('navigation', { name: 'Posts pagination' }),
    ).toBeVisible()
  })
})
