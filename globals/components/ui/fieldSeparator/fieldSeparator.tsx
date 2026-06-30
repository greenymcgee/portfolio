import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { Separator } from '../separator'

type Props = ComponentProps<'div'>

export function FieldSeparator({ children, className, ...props }: Props) {
  return (
    <div
      className={cn(
        'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
        className,
      )}
      data-content={!!children}
      data-slot="field-separator"
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children ? (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      ) : null}
    </div>
  )
}
