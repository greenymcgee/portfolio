import { render, screen } from '@testing-library/react'

import { Skeleton } from '..'

describe('<Skeleton />', () => {
  it('should set data-slot on the root element', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute(
      'data-slot',
      'skeleton',
    )
  })

  it('should merge className onto the root element', () => {
    render(<Skeleton className="h-9 w-32" data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('h-9', 'w-32')
  })

  it('should respect prefers-reduced-motion', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass(
      'motion-reduce:animate-none',
    )
  })
})
