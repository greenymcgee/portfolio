import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils/index'

export function FieldContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/field-content flex flex-1 flex-col gap-1 leading-snug',
        className,
      )}
      data-slot="field-content"
      {...props}
    />
  )
}
