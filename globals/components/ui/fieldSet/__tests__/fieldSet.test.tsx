import { render, screen } from '@testing-library/react'

import { FieldSet } from '..'

const PROPS: PropsOf<typeof FieldSet> = { children: 'Content' }

describe('<FieldSet />', () => {
  it('renders children', () => {
    render(<FieldSet {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="field-set"', () => {
    render(<FieldSet {...PROPS} />)
    expect(screen.getByRole('group')).toHaveAttribute('data-slot', 'field-set')
  })

  it('merges className onto the fieldset element', () => {
    render(<FieldSet {...PROPS} className="custom-class" />)
    expect(screen.getByRole('group')).toHaveClass('custom-class')
  })

  it('forwards props to the fieldset element', () => {
    render(<FieldSet {...PROPS} id="fieldset-id" />)
    expect(screen.getByRole('group')).toHaveAttribute('id', 'fieldset-id')
  })
})
