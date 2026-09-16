import { render, screen } from '@testing-library/react'

import { EXPERIENCES } from '@/globals/constants'

import { Experience } from '..'

describe('<Experience />', () => {
  it.each(EXPERIENCES)('should render cards', ({ id }) => {
    render(<Experience />)
    expect(screen.getByTestId(`card-${id}`)).toBeVisible()
  })

  it('should render start dates', () => {
    render(<Experience />)
    expect(
      screen.getByText(new RegExp(`^${EXPERIENCES[0].startDate}`)),
    ).toBeVisible()
  })

  it('should render end dates', () => {
    render(<Experience />)
    expect(
      screen.getByText(new RegExp(`${EXPERIENCES[1].endDate}`)),
    ).toBeVisible()
  })
})
