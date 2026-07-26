import { render, screen } from '@testing-library/react'

import { FieldError } from '..'

describe('<FieldError />', () => {
  it('renders nothing when no children or errors are provided', () => {
    const { container } = render(<FieldError />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when errors array is empty', () => {
    const { container } = render(<FieldError errors={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders children when provided', () => {
    render(<FieldError>Custom error</FieldError>)
    expect(screen.getByText('Custom error')).toBeVisible()
  })

  it('renders a single error message from the errors prop', () => {
    const errors = ['Name is required']
    render(<FieldError errors={errors} />)
    expect(screen.getByText('Name is required')).toBeVisible()
  })

  it('renders a list when multiple errors are provided', () => {
    const errors = ['Too short', 'Invalid format']
    render(<FieldError errors={errors} />)
    expect(screen.getByRole('list')).toBeVisible()
    expect(screen.getByText('Too short')).toBeVisible()
  })

  it('has role="alert" and data-slot="field-error" when rendered', () => {
    render(<FieldError>Error</FieldError>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('data-slot', 'field-error')
  })

  it('merges className onto the div element', () => {
    render(<FieldError className="custom-class">Error</FieldError>)
    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })
})
