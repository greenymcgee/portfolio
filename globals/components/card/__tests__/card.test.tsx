import { render, screen } from '@testing-library/react'

import { Card } from '..'

const PROPS: PropsOf<typeof Card> = {
  description: 'Description',
  id: 'unique',
  link: 'http://test-greeny.nothing',
  title: 'Title',
}

describe('<Card />', () => {
  it('should take an optional as prop', () => {
    const { container } = render(<Card {...PROPS} as="section" />)
    expect(container.querySelector('section')).toBeVisible()
  })

  it('should take an optional subtitle prop', () => {
    const subtitle = 'Senior Software Engineer'
    render(<Card {...PROPS} subtitle={subtitle} />)
    expect(screen.getByText(subtitle)).toBeVisible()
  })

  it.each([
    { attribute: 'rel', value: 'noopener noreferrer' },
    { attribute: 'target', value: '_blank' },
  ])('should take an optional external prop', ({ attribute, value }) => {
    render(<Card {...PROPS} external />)
    expect(
      screen.getByRole('link', { name: PROPS.title as string }),
    ).toHaveAttribute(attribute, value)
  })
})
