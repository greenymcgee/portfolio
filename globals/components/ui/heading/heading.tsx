import { ComponentProps } from 'react'
import { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { HEADING_VARIANTS } from './constants'

type Props = ComponentProps<'h1'> &
  VariantProps<typeof HEADING_VARIANTS> & {
    level?: 'h1' | 'h2' | 'h3'
  }

export function Heading({
  className,
  level: As = 'h1',
  size,
  ...options
}: Props) {
  return (
    <As className={cn(HEADING_VARIANTS({ className, size }))} {...options} />
  )
}
