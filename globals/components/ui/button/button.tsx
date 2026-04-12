import { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { BUTTON_VARIANTS } from './constants'

type Props = ComponentProps<'button'> &
  VariantProps<typeof BUTTON_VARIANTS> & {
    asChild?: boolean
  }

export function Button({
  asChild = false,
  className,
  size = 'default',
  type = asChild ? undefined : 'button',
  variant = 'default',
  ...props
}: Props) {
  const Tag = asChild ? Slot : 'button'

  return (
    <Tag
      className={cn(BUTTON_VARIANTS({ className, size, variant }))}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      type={type}
      {...props}
    />
  )
}
