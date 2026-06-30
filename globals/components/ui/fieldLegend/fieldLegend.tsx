import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils/index'

type Props = ComponentProps<'legend'> & { variant?: 'legend' | 'label' }

export function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: Props) {
  return (
    <legend
      className={cn(
        'mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base',
        className,
      )}
      data-slot="field-legend"
      data-variant={variant}
      {...props}
    />
  )
}
