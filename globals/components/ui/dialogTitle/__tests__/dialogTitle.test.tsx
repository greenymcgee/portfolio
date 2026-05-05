import { render, screen } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogContent } from '../../dialogContent'
import { DialogTitle } from '..'

describe('<DialogTitle />', () => {
  it('renders as a heading', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>title text</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('heading', { name: 'title text' })).toBeVisible()
  })

  it('has data-slot="dialog-title"', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>title text</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('heading', { name: 'title text' })).toHaveAttribute(
      'data-slot',
      'dialog-title',
    )
  })

  it('merges className', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle className="custom-class">title text</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('heading', { name: 'title text' })).toHaveClass(
      'custom-class',
    )
  })
})
