import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-muted motion-reduce:animate-none animate-pulse rounded-md',
        className,
      )}
      data-slot="skeleton"
      {...props}
    />
  )
}
