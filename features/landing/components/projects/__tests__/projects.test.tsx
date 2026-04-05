import { render, screen } from '@testing-library/react'

import { PROJECTS } from '@/globals/constants'

import { Projects } from '..'

describe('<Projects />', () => {
  it.each(PROJECTS)('should render cards', ({ id }) => {
    render(<Projects />)
    expect(screen.getByTestId(`card-${id}`)).toBeVisible()
  })

  it('should render tools', () => {
    render(<Projects />)
    expect(screen.getAllByTestId('card-tools')).toHaveLength(PROJECTS.length)
  })
})
