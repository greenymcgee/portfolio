import { render, screen } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogContent } from '../../dialogContent'
import { DialogClose } from '..'

describe('<DialogClose />', () => {
  it('has data-slot="dialog-close"', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogClose>Close me</DialogClose>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'Close me' })).toHaveAttribute(
      'data-slot',
      'dialog-close',
    )
  })

  it('merges className', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogClose className="custom-class">Close me</DialogClose>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'Close me' })).toHaveClass(
      'custom-class',
    )
  })
})
