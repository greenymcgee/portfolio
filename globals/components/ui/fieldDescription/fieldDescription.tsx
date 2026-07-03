import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'text-muted-foreground text-left text-sm leading-normal font-normal',
        'group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
        'last:mt-0 nth-last-2:-mt-1',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      data-slot="field-description"
      {...props}
    />
  )
}
