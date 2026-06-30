import { render, screen } from '@testing-library/react'

import { FieldLabel } from '..'

const PROPS: PropsOf<typeof FieldLabel> = {
  children: 'Email address',
  htmlFor: 'email-input',
}

describe('<FieldLabel />', () => {
  it('renders children', () => {
    render(<FieldLabel {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="field-label"', () => {
    const { container } = render(<FieldLabel {...PROPS} />)
    expect(container.querySelector('label')).toHaveAttribute('data-slot', 'field-label')
  })

  it('forwards htmlFor to the label element', () => {
    const { container } = render(<FieldLabel {...PROPS} />)
    expect(container.querySelector('label')).toHaveAttribute('for', PROPS.htmlFor)
  })

  it('merges className onto the label element', () => {
    const { container } = render(<FieldLabel {...PROPS} className="custom-class" />)
    expect(container.querySelector('label')).toHaveClass('custom-class')
  })
})
