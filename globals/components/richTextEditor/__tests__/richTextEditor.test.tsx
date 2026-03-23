import { render, screen } from '@testing-library/react'

import { RichTextEditor } from '@/globals/components'

describe('<RichTextEditor />', () => {
  it('should show the toolbar plugin when editing with onChange', () => {
    render(<RichTextEditor editing onChange={vi.fn()} />)
    expect(screen.getByTestId('toolbar-plugin')).toBeVisible()
  })

  it('should not render the toolbar plugin when not editing', () => {
    render(<RichTextEditor editing={false} onChange={vi.fn()} />)
    expect(screen.queryByTestId('toolbar-plugin')).not.toBeInTheDocument()
  })
})
