import { type ComponentProps } from 'react'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils/index'

import { FIELD_VARIANTS } from './constant'

type Props = ComponentProps<'div'> & VariantProps<typeof FIELD_VARIANTS>

export function Field({
  className,
  orientation = 'vertical',
  ...props
}: Props) {
  return (
    <div
      className={cn(FIELD_VARIANTS({ orientation }), className)}
      data-orientation={orientation}
      data-slot="field"
      role="group"
      {...props}
    />
  )
}
