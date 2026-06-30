import { faker } from '@faker-js/faker'
import { render, screen } from '@testing-library/react'

import { Label } from '..'

const PROPS: PropsOf<typeof Label> = {
  children: 'Email address',
}

const HTML_FOR = faker.string.alpha()

describe('<Label />', () => {
  it('renders children', () => {
    render(<Label htmlFor={HTML_FOR} {...PROPS} />)
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="label"', () => {
    const { container } = render(<Label htmlFor={HTML_FOR} {...PROPS} />)

    expect(container.querySelector('label')).toHaveAttribute(
      'data-slot',
      'label',
    )
  })

  it('merges className onto the label element', () => {
    const { container } = render(
      <Label {...PROPS} className="custom-class" htmlFor={HTML_FOR} />,
    )
    expect(container.querySelector('label')).toHaveClass('custom-class')
  })

  it('forwards htmlFor to the label element', () => {
    const { container } = render(<Label {...PROPS} htmlFor="input-id" />)
    expect(container.querySelector('label')).toHaveAttribute('for', 'input-id')
  })
})
