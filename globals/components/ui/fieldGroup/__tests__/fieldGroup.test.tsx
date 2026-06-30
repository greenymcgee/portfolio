import { render, screen } from '@testing-library/react'

import { FieldGroup } from '..'

const PROPS: PropsOf<typeof FieldGroup> = { children: 'Content' }

describe('<FieldGroup />', () => {
  it('renders children', () => {
    render(<FieldGroup {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="field-group"', () => {
    const { container } = render(<FieldGroup {...PROPS} />)
    expect(container.firstChild).toHaveAttribute('data-slot', 'field-group')
  })

  it('merges className onto the div element', () => {
    const { container } = render(<FieldGroup {...PROPS} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards props to the div element', () => {
    const { container } = render(<FieldGroup {...PROPS} id="group-id" />)
    expect(container.firstChild).toHaveAttribute('id', 'group-id')
  })
})
