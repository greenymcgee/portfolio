import { render, screen } from '@testing-library/react'

import { Heading } from '..'

const PROPS: PropsOf<typeof Heading> = {
  children: 'Section title',
}

describe('<Heading />', () => {
  it('should render children as a level one heading by default', () => {
    render(<Heading {...PROPS} />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: PROPS.children as string,
      }),
    ).toBeVisible()
  })

  it('should render as a level two heading when level is h2', () => {
    render(<Heading {...PROPS} level="h2" />)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: PROPS.children as string,
      }),
    ).toBeVisible()
  })

  it('should forward native props to the heading element', () => {
    const title = 'Tooltip text'
    render(<Heading {...PROPS} id="my-heading" title={title} />)
    const heading = screen.getByRole('heading', {
      level: 1,
      name: PROPS.children as string,
    })
    expect(heading).toHaveAttribute('id', 'my-heading')
    expect(heading).toHaveAttribute('title', title)
  })

  it('should merge className onto the heading element', () => {
    render(<Heading {...PROPS} className="custom-class" />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: PROPS.children as string,
      }),
    ).toHaveClass('custom-class')
  })
})
