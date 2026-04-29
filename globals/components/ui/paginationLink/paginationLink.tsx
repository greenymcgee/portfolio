import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../button'

type ButtonProps = Pick<ComponentProps<typeof Button>, 'size'>
type AnchorProps = ComponentProps<'a'>
type Extensions = ButtonProps & AnchorProps

type Props = Extensions & {
  isActive?: boolean
}

export function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: Props) {
  return (
    <Button
      asChild
      className={cn(className)}
      size={size}
      variant={isActive ? 'outline' : 'ghost'}
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
      <a
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive}
        data-slot="pagination-link"
        {...props}
      />
    </Button>
  )
}
