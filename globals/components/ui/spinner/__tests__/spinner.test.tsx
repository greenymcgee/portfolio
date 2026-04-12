import { render, screen } from '@testing-library/react'

import { Spinner } from '..'

describe('<Spinner />', () => {
  it('should expose a status role for the loading label', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Loading')).toHaveAttribute('role', 'status')
  })
})
