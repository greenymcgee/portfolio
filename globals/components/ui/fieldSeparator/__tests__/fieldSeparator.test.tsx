import { render, screen } from '@testing-library/react'

import { FieldSeparator } from '..'

describe('<FieldSeparator />', () => {
  it('renders with data-slot="field-separator"', () => {
    const { container } = render(<FieldSeparator />)
    expect(container.querySelector('[data-slot="field-separator"]')).toBeInTheDocument()
  })

  it('sets data-content to false when no children are provided', () => {
    const { container } = render(<FieldSeparator />)
    expect(container.querySelector('[data-slot="field-separator"]')).toHaveAttribute(
      'data-content',
      'false',
    )
  })

  it('renders children content when provided', () => {
    render(<FieldSeparator>or</FieldSeparator>)
    expect(screen.getByText('or')).toBeVisible()
  })

  it('sets data-content to true when children are provided', () => {
    const { container } = render(<FieldSeparator>or</FieldSeparator>)
    expect(container.querySelector('[data-slot="field-separator"]')).toHaveAttribute(
      'data-content',
      'true',
    )
  })

  it('merges className onto the wrapper div', () => {
    const { container } = render(<FieldSeparator className="custom-class" />)
    expect(container.querySelector('[data-slot="field-separator"]')).toHaveClass('custom-class')
  })
})
