import { ComponentProps } from 'react'
import Link, { LinkProps } from 'next/link'

import { cn } from '@/lib/utils'

import { Button } from '../button'

type ButtonProps = Pick<ComponentProps<typeof Button>, 'size'>
type AnchorProps = ComponentProps<'a'>
type Extensions = ButtonProps & AnchorProps & LinkProps

type Props = Extensions & {
  disabled?: boolean
  isActive?: boolean
}

export function PaginationLink({
  className,
  disabled,
  isActive,
  size = 'icon',
  ...props
}: Props) {
  return (
    <Button
      aria-disabled={disabled}
      asChild
      className={cn(className, { 'pointer-events-none opacity-50': disabled })}
      size={size}
      tabIndex={disabled ? -1 : 0}
      variant={isActive ? 'outline' : 'ghost'}
    >
      <Link
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive}
        data-slot="pagination-link"
        scroll={false}
        {...props}
      />
    </Button>
  )
}
