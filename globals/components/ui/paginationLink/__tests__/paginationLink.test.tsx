import { render, screen } from '@testing-library/react'

import { PaginationLink } from '..'

const PROPS: PropsOf<typeof PaginationLink> = {
  href: '/posts?page=1',
}

describe('<PaginationLink />', () => {
  it('should set aria-current="page" when isActive is true', () => {
    render(<PaginationLink {...PROPS} isActive />)
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page')
  })

  it('should not set aria-current when isActive is false by default', () => {
    render(<PaginationLink {...PROPS} />)
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current')
  })

  it('should forward href to the underlying element', () => {
    render(<PaginationLink {...PROPS} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', PROPS.href)
  })

  it('should mark the link as disabled when disabled is true', () => {
    render(<PaginationLink {...PROPS} disabled />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(link).toHaveClass('pointer-events-none', 'opacity-50')
  })
})
