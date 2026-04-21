import { ComponentProps } from 'react'
import { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { HEADING_VARIANTS } from './constants'

type Props = ComponentProps<'h1'> &
  Omit<VariantProps<typeof HEADING_VARIANTS>, 'level'> & {
    level?: 'h1' | 'h2'
  }

export function Heading({ className, level = 'h1', ...options }: Props) {
  const As = level

  return (
    <As className={cn(HEADING_VARIANTS({ className, level }))} {...options} />
  )
}
