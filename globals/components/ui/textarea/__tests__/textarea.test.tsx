import { render, screen } from '@testing-library/react'

import { Textarea } from '..'

const PROPS: PropsOf<typeof Textarea> = { 'aria-label': 'Test field' }

describe('<Textarea />', () => {
  it('renders with data-slot="textarea"', () => {
    const { container } = render(<Textarea {...PROPS} />)
    expect(container.querySelector('textarea')).toHaveAttribute('data-slot', 'textarea')
  })

  it('merges className onto the textarea element', () => {
    render(<Textarea {...PROPS} className="custom-class" />)
    expect(screen.getByLabelText(PROPS['aria-label'] as string)).toHaveClass('custom-class')
  })

  it('forwards props to the textarea element', () => {
    render(<Textarea {...PROPS} id="field-id" />)
    expect(screen.getByLabelText(PROPS['aria-label'] as string)).toHaveAttribute('id', 'field-id')
  })

  it('is disabled when the disabled prop is set', () => {
    render(<Textarea {...PROPS} disabled />)
    expect(screen.getByLabelText(PROPS['aria-label'] as string)).toBeDisabled()
  })
})
