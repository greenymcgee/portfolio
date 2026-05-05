import { render } from '@testing-library/react'

import { Dialog } from '../../dialog'
import { DialogPortal } from '../../dialogPortal'
import { DialogOverlay } from '..'

describe('<DialogOverlay />', () => {
  it('has data-slot="dialog-overlay"', () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay />
        </DialogPortal>
      </Dialog>,
    )
    expect(
      document.querySelector('[data-slot="dialog-overlay"]'),
    ).toBeInTheDocument()
  })

  it('merges className', () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay className="custom-class" />
        </DialogPortal>
      </Dialog>,
    )
    expect(
      document.querySelector('[data-slot="dialog-overlay"]'),
    ).toHaveClass('custom-class')
  })
})
