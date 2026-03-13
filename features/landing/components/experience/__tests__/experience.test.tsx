import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EXPERIENCES } from '@/globals/constants'

import { Experience } from '..'

describe('<Experience />', () => {
  it('should render interactive cards', async () => {
    render(<Experience />)
    const card = screen.getByTestId(`card-${EXPERIENCES[0].id}`)
    await userEvent.hover(card)
    expect(card).toHaveAttribute('data-test-active', 'true')
    await userEvent.unhover(card)
    expect(card).toHaveAttribute('data-test-active', 'false')
  })
})
