import { render, screen } from '@testing-library/react'

import { ROUTES } from '@/globals/constants'

import { Pagination } from '../pagination'

describe('<Pagination />', () => {
  it('should render nothing when totalPages is 1', () => {
    render(<Pagination currentPage={0} totalPages={1} />)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('should render nothing when totalPages is 0', () => {
    render(<Pagination currentPage={0} totalPages={0} />)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it.each([1, 2, 3])('should render a link per page', (page) => {
    render(<Pagination currentPage={0} totalPages={3} />)
    expect(screen.getByRole('link', { name: String(page) })).toHaveAttribute(
      'href',
      `${ROUTES.posts}?page=${page - 1}`,
    )
  })

  it('should mark the active page with aria-current="page"', () => {
    render(<Pagination currentPage={1} totalPages={3} />)
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('should disable Previous at the first page', () => {
    render(<Pagination currentPage={0} totalPages={3} />)
    expect(
      screen.getByRole('link', { name: /go to previous page/i }),
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('should disable Next at the last page', () => {
    render(<Pagination currentPage={2} totalPages={3} />)
    expect(
      screen.getByRole('link', { name: /go to next page/i }),
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('should render an ellipsis for large page sets', () => {
    render(<Pagination currentPage={4} totalPages={10} />)
    expect(screen.getAllByText('More pages').length).toBeGreaterThan(0)
  })
})
