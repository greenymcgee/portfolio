import { render, screen } from '@testing-library/react'

import { Input } from '..'

const PROPS: PropsOf<typeof Input> = { 'aria-label': 'Test field' }

describe('<Input />', () => {
  it('renders with data-slot="input"', () => {
    const { container } = render(<Input {...PROPS} />)
    expect(container.querySelector('input')).toHaveAttribute('data-slot', 'input')
  })

  it('forwards type to the input element', () => {
    const { container } = render(<Input {...PROPS} type="email" />)
    expect(container.querySelector('input')).toHaveAttribute('type', 'email')
  })

  it('merges className onto the input element', () => {
    render(<Input {...PROPS} className="custom-class" />)
    expect(screen.getByLabelText(PROPS['aria-label'] as string)).toHaveClass('custom-class')
  })

  it('forwards props to the input element', () => {
    render(<Input {...PROPS} id="field-id" />)
    expect(screen.getByLabelText(PROPS['aria-label'] as string)).toHaveAttribute('id', 'field-id')
  })

  it('is disabled when the disabled prop is set', () => {
    render(<Input {...PROPS} disabled />)
    expect(screen.getByLabelText(PROPS['aria-label'] as string)).toBeDisabled()
  })
})
