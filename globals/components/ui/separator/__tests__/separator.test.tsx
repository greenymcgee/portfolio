import { render } from '@testing-library/react'

import { Separator } from '..'

describe('<Separator />', () => {
  it('renders with data-slot="separator"', () => {
    const { container } = render(<Separator />)
    expect(container.querySelector('[data-slot="separator"]')).toBeInTheDocument()
  })

  it('is decorative by default', () => {
    const { container } = render(<Separator />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute('role', 'none')
  })

  it('renders as a separator role when not decorative', () => {
    const { container } = render(<Separator decorative={false} />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
      'role',
      'separator',
    )
  })

  it('defaults to horizontal orientation', () => {
    const { container } = render(<Separator />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    )
  })

  it('merges className onto the separator element', () => {
    const { container } = render(<Separator className="custom-class" />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveClass('custom-class')
  })
})
