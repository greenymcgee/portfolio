import { render, screen } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogContent } from '../../dialogContent'
import { DialogFooter } from '..'

describe('<DialogFooter />', () => {
  it('renders children', () => {
    render(<DialogFooter>footer content</DialogFooter>)
    expect(screen.getByText('footer content')).toBeVisible()
  })

  it('has data-slot="dialog-footer"', () => {
    const { container } = render(<DialogFooter />)
    expect(container.firstChild).toHaveAttribute('data-slot', 'dialog-footer')
  })

  it('merges className', () => {
    const { container } = render(<DialogFooter className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders a close button when showCloseButton is true', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible()
  })
})
