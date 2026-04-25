import { render, screen } from '@testing-library/react'

import { Heading } from '..'

type Level = NonNullable<PropsOf<typeof Heading>['level']>

const PROPS: PropsOf<typeof Heading> = {
  children: 'Section title',
}

const LEVEL_MAP: Record<Level, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
}

describe('<Heading />', () => {
  it.each(['h1', 'h2', 'h3'])(
    'should render children as the given level',
    (level) => {
      render(<Heading {...PROPS} level={level as Level} />)
      expect(
        screen.getByRole('heading', {
          level: LEVEL_MAP[level as Level],
          name: PROPS.children as string,
        }),
      ).toBeVisible()
    },
  )

  it('should render as a level 1 heading by default', () => {
    render(<Heading {...PROPS} />)
    expect(
      screen.getByRole('heading', {
        level: 1,
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
