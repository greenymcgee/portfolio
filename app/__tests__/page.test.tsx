import { render, screen } from '@testing-library/react'

import HomePage from '../page'

describe('<HomePage />', () => {
  it('should render an h1', () => {
    render(<HomePage />)
    expect(screen.getByTestId('home-page-heading').tagName).toBe('H1')
  })
})
