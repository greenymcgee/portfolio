import { render, screen } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogContent } from '..'

describe('<DialogContent />', () => {
  it('renders a close button by default', () => {
    render(
      <Dialog open>
        <DialogContent>content</DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible()
  })

  it('does not render a close button when showCloseButton is false', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>content</DialogContent>
      </Dialog>,
    )
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument()
  })

  it('has data-slot="dialog-content"', () => {
    render(
      <Dialog open>
        <DialogContent>content</DialogContent>
      </Dialog>,
    )
    expect(
      document.querySelector('[data-slot="dialog-content"]'),
    ).toBeInTheDocument()
  })

  it('merges className', () => {
    render(
      <Dialog open>
        <DialogContent className="custom-class">content</DialogContent>
      </Dialog>,
    )
    expect(
      document.querySelector('[data-slot="dialog-content"]'),
    ).toHaveClass('custom-class')
  })
})
