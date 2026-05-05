import { render, screen } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogPortal } from '..'

describe('<DialogPortal />', () => {
  it('renders children', () => {
    render(
      <Dialog open>
        <DialogPortal>
          <div>portal content</div>
        </DialogPortal>
      </Dialog>,
    )
    expect(screen.getByText('portal content')).toBeVisible()
  })
})
