import { render, screen } from '@testing-library/react'

import { PROJECTS } from '@/globals/constants'

import { Projects } from '..'

describe('<Projects />', () => {
  it.each(PROJECTS)('should render cards', ({ id }) => {
    render(<Projects />)
    expect(screen.getByTestId(`card-${id}`)).toBeVisible()
  })
})
