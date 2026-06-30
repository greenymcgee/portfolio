import { render, screen } from '@testing-library/react'

import { Field } from '..'

const PROPS: PropsOf<typeof Field> = { children: 'Content' }

describe('<Field />', () => {
  it('renders children', () => {
    render(<Field {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has role="group" and data-slot="field"', () => {
    render(<Field {...PROPS} />)
    const field = screen.getByRole('group')
    expect(field).toHaveAttribute('data-slot', 'field')
  })

  it('defaults to vertical orientation', () => {
    render(<Field {...PROPS} />)
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('sets data-orientation when orientation is provided', () => {
    render(<Field {...PROPS} orientation="horizontal" />)
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('merges className onto the div element', () => {
    render(<Field {...PROPS} className="custom-class" />)
    expect(screen.getByRole('group')).toHaveClass('custom-class')
  })

  it('forwards props to the div element', () => {
    render(<Field {...PROPS} id="field-root" />)
    expect(screen.getByRole('group')).toHaveAttribute('id', 'field-root')
  })
})
