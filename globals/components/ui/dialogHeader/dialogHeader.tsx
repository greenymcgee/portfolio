import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      data-slot="dialog-header"
      {...props}
    />
  )
}
