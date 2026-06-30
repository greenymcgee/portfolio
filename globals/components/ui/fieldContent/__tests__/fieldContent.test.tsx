import { render, screen } from '@testing-library/react'

import { FieldContent } from '..'

const PROPS: PropsOf<typeof FieldContent> = { children: 'Content' }

describe('<FieldContent />', () => {
  it('renders children', () => {
    render(<FieldContent {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="field-content"', () => {
    const { container } = render(<FieldContent {...PROPS} />)
    expect(container.firstChild).toHaveAttribute('data-slot', 'field-content')
  })

  it('merges className onto the div element', () => {
    const { container } = render(<FieldContent {...PROPS} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards props to the div element', () => {
    const { container } = render(<FieldContent {...PROPS} id="field-content-root" />)
    expect(container.firstChild).toHaveAttribute('id', 'field-content-root')
  })
})
