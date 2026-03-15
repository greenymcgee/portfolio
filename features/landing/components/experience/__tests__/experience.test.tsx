import { render, screen } from '@testing-library/react'

import { EXPERIENCES } from '@/globals/constants'

import { Experience } from '..'

describe('<Experience />', () => {
  it.each(EXPERIENCES)('should render cards', ({ id }) => {
    render(<Experience />)
    expect(screen.getByTestId(`card-${id}`)).toBeVisible()
  })
})
