'use client'

import { ComponentProps } from 'react'
import { Title } from '@radix-ui/react-dialog'

import { cn } from '@/lib/utils'

type Props = ComponentProps<typeof Title>

export function DialogTitle({ className, ...props }: Props) {
  return (
    <Title
      className={cn('font-heading leading-none font-medium', className)}
      data-slot="dialog-title"
      {...props}
    />
  )
}
