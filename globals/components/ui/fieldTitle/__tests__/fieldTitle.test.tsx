import { render, screen } from '@testing-library/react'

import { FieldTitle } from '..'

const PROPS: PropsOf<typeof FieldTitle> = { children: 'Title' }

describe('<FieldTitle />', () => {
  it('renders children', () => {
    render(<FieldTitle {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="field-label"', () => {
    const { container } = render(<FieldTitle {...PROPS} />)
    expect(container.firstChild).toHaveAttribute('data-slot', 'field-label')
  })

  it('merges className onto the div element', () => {
    const { container } = render(<FieldTitle {...PROPS} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards props to the div element', () => {
    const { container } = render(<FieldTitle {...PROPS} id="title-id" />)
    expect(container.firstChild).toHaveAttribute('id', 'title-id')
  })
})
