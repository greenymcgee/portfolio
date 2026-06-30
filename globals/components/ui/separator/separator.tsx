'use client'

import { type ComponentProps } from 'react'
import { Root } from '@radix-ui/react-separator'

import { cn } from '@/lib/utils/index'

export function Separator({
  className,
  decorative = true,
  orientation = 'horizontal',
  ...props
}: ComponentProps<typeof Root>) {
  return (
    <Root
      className={cn(
        'bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
        className,
      )}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      {...props}
    />
  )
}
