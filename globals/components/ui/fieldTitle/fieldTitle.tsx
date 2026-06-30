import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function FieldTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  )
}
