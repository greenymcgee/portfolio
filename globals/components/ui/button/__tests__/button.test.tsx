import { render, screen } from '@testing-library/react'

import { Button } from '..'

const PROPS: PropsOf<typeof Button> = {
  children: 'Click me',
}

describe('<Button />', () => {
  it('should render children', () => {
    render(<Button {...PROPS} />)
    expect(
      screen.getByRole('button', { name: PROPS.children as string }),
    ).toBeVisible()
  })

  it('should use type button and data-slot by default', () => {
    render(<Button {...PROPS} />)
    const button = screen.getByRole('button', {
      name: PROPS.children as string,
    })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('should use default variant and size data attributes', () => {
    render(<Button {...PROPS} />)
    const button = screen.getByRole('button', {
      name: PROPS.children as string,
    })
    expect(button).toHaveAttribute('data-variant', 'default')
    expect(button).toHaveAttribute('data-size', 'default')
  })

  it('should set data-variant when variant prop is provided', () => {
    render(<Button {...PROPS} variant="destructive" />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'data-variant',
      'destructive',
    )
  })

  it('should set data-size when size prop is provided', () => {
    render(<Button {...PROPS} size="sm" />)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm')
  })

  it('should forward type when overridden', () => {
    render(<Button {...PROPS} type="submit" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('should forward button props to the button element', () => {
    render(<Button {...PROPS} disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should merge className onto the button element', () => {
    render(<Button {...PROPS} className="custom-class" />)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('should render as the child element when asChild is true', () => {
    const href = 'https://example.com'
    render(
      <Button asChild>
        <a href={href}>Link text</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Link text' })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('data-slot', 'button')
  })
})
