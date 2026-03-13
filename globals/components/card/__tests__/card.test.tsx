import { render, screen } from '@testing-library/react'

import { PROJECTS } from '@/globals/constants'

import { Card } from '..'

const [PROJECT] = PROJECTS

const PROPS: PropsOf<typeof Card> = {
  activeId: PROJECT.id,
  description: 'Description',
  id: PROJECT.id,
  link: 'http://test-greeny.nothing',
  name: PROJECT.name,
  onUserInteraction: vi.fn(),
  resetActiveId: vi.fn(),
  tools: PROJECT.tools,
}

describe('<Card />', () => {
  it('should take an optional as prop', () => {
    render(<Card {...PROPS} as="h1" />)
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible()
  })

  it('should take an optional endDate prop', () => {
    const endDate = '2023'
    render(<Card {...PROPS} endDate={endDate} startDate="2021" />)
    expect(screen.getByText((text) => text.includes(endDate))).toBeVisible()
  })

  it('should take an optional startDate prop', () => {
    const startDate = '2021'
    render(<Card {...PROPS} startDate={startDate} />)
    expect(screen.getByText(startDate)).toBeVisible()
  })

  it('should take an optional title prop', () => {
    const title = 'Senior Software Engineer'
    render(<Card {...PROPS} title={title} />)
    expect(screen.getByText(title)).toBeVisible()
  })
})
