import { render, screen } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogContent } from '../../dialogContent'
import { DialogDescription } from '..'

describe('<DialogDescription />', () => {
  it('renders children', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogDescription>description text</DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText('description text')).toBeVisible()
  })

  it('has data-slot="dialog-description"', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogDescription>description text</DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText('description text')).toHaveAttribute(
      'data-slot',
      'dialog-description',
    )
  })

  it('merges className', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogDescription className="custom-class">
            description text
          </DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText('description text')).toHaveClass('custom-class')
  })
})
