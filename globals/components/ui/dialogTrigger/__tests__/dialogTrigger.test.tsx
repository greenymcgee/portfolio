import { render, screen } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogTrigger } from '..'

describe('<DialogTrigger />', () => {
  it('renders a button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeVisible()
  })

  it('has data-slot="dialog-trigger"', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute(
      'data-slot',
      'dialog-trigger',
    )
  })

  it('merges className', () => {
    render(
      <Dialog>
        <DialogTrigger className="custom-class">Open</DialogTrigger>
      </Dialog>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toHaveClass(
      'custom-class',
    )
  })
})
