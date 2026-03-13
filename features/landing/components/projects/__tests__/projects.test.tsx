import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PROJECTS } from '@/globals/constants'

import { Projects } from '..'

describe('<Projects />', () => {
  it('should render interactive cards', async () => {
    render(<Projects />)
    const card = screen.getByTestId(`card-${PROJECTS[0].id}`)
    await userEvent.hover(card)
    expect(card).toHaveAttribute('data-test-active', 'true')
    await userEvent.unhover(card)
    expect(card).toHaveAttribute('data-test-active', 'false')
  })
})
