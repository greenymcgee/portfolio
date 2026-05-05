import { render, screen } from '@testing-library/react'

import { DialogHeader } from '..'

describe('<DialogHeader />', () => {
  it('renders children', () => {
    render(<DialogHeader>header content</DialogHeader>)
    expect(screen.getByText('header content')).toBeVisible()
  })

  it('has data-slot="dialog-header"', () => {
    const { container } = render(<DialogHeader />)
    expect(container.firstChild).toHaveAttribute('data-slot', 'dialog-header')
  })

  it('merges className', () => {
    const { container } = render(<DialogHeader className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
