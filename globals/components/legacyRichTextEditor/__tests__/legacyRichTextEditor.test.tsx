import { render, screen } from '@testing-library/react'

import { LegacyRichTextEditor } from '@/globals/components'

describe('<LegacyRichTextEditor />', () => {
  it('should show the toolbar plugin when editing with onChange', () => {
    render(<LegacyRichTextEditor editing onChange={vi.fn()} />)
    expect(screen.getByTestId('toolbar-plugin')).toBeVisible()
  })

  it('should not render the toolbar plugin when not editing', () => {
    render(<LegacyRichTextEditor editing={false} onChange={vi.fn()} />)
    expect(screen.queryByTestId('toolbar-plugin')).not.toBeInTheDocument()
  })
})
