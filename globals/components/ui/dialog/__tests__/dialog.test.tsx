import { fireEvent, render, screen } from '@testing-library/react'

import { DialogContent } from '../../dialogContent'
import { DialogTrigger } from '../../dialogTrigger'
import { Dialog } from '..'

describe('<Dialog />', () => {
  it('does not render content when closed', () => {
    render(
      <Dialog>
        <DialogContent>content</DialogContent>
      </Dialog>,
    )
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders content when open', () => {
    render(
      <Dialog open>
        <DialogContent>content</DialogContent>
      </Dialog>,
    )
    expect(screen.getByText('content')).toBeVisible()
  })

  it('opens when the trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>content</DialogContent>
      </Dialog>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByText('content')).toBeVisible()
  })
})
