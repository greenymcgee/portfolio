import { render, screen } from '@testing-library/react'

import { FieldDescription } from '..'

const PROPS: PropsOf<typeof FieldDescription> = { children: 'Helper text' }

describe('<FieldDescription />', () => {
  it('renders children', () => {
    render(<FieldDescription {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="field-description"', () => {
    render(<FieldDescription {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toHaveAttribute(
      'data-slot',
      'field-description',
    )
  })

  it('merges className onto the p element', () => {
    render(<FieldDescription {...PROPS} className="custom-class" />)
    expect(screen.getByText(PROPS.children as string)).toHaveClass('custom-class')
  })

  it('forwards props to the p element', () => {
    render(<FieldDescription {...PROPS} id="description-id" />)
    expect(screen.getByText(PROPS.children as string)).toHaveAttribute('id', 'description-id')
  })
})
