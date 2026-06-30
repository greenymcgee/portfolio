import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils/index'

export function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
  return (
    <fieldset
      className={cn(
        'flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3',
        'has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      data-slot="field-set"
      {...props}
    />
  )
}
