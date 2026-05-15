import { fireEvent, render, screen } from '@testing-library/react'

import { Switch } from '..'

const PROPS: PropsOf<typeof Switch> = {
  'aria-label': 'Enable notifications',
}

describe('<Switch />', () => {
  it('should render a switch with an accessible name', () => {
    render(<Switch {...PROPS} />)
    expect(
      screen.getByRole('switch', { name: PROPS['aria-label'] }),
    ).toBeVisible()
  })

  it('should set data-slot on the root and thumb', () => {
    render(<Switch {...PROPS} />)
    const root = screen.getByRole('switch')
    expect(root).toHaveAttribute('data-slot', 'switch')
    expect(root.querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument()
  })

  it('should use default size data attribute', () => {
    render(<Switch {...PROPS} />)
    expect(screen.getByRole('switch')).toHaveAttribute('data-size', 'default')
  })

  it('should set data-size when size prop is small', () => {
    render(<Switch {...PROPS} size="sm" />)
    expect(screen.getByRole('switch')).toHaveAttribute('data-size', 'sm')
  })

  it('should reflect checked state when checked prop is true', () => {
    render(<Switch {...PROPS} checked />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('should reflect unchecked state when checked prop is false', () => {
    render(<Switch {...PROPS} checked={false} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('should disable the switch when disabled prop is true', () => {
    render(<Switch {...PROPS} disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('should merge className onto the root element', () => {
    render(<Switch {...PROPS} className="custom-switch-class" />)
    expect(screen.getByRole('switch')).toHaveClass('custom-switch-class')
  })

  it('should call onCheckedChange when toggled', () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch {...PROPS} checked={false} onCheckedChange={onCheckedChange} />,
    )
    fireEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('should use default variant data attribute', () => {
    render(<Switch {...PROPS} />)
    expect(screen.getByRole('switch')).toHaveAttribute(
      'data-variant',
      'default',
    )
  })

  it('should set data-variant when variant prop is provided', () => {
    render(<Switch {...PROPS} variant="inverted" />)
    expect(screen.getByRole('switch')).toHaveAttribute(
      'data-variant',
      'inverted',
    )
  })
})
