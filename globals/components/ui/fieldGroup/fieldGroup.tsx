import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils/index'

export function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-7',
        'data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4',
        className,
      )}
      data-slot="field-group"
      {...props}
    />
  )
}
