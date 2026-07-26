'use client'

import { ComponentProps } from 'react'
import { Title } from '@radix-ui/react-dialog'

import { cn } from '@/lib/utils'

type Props = ComponentProps<typeof Title>

export function DialogTitle({ className, ...props }: Props) {
  return (
    <Title
      className={cn('font-sans text-lg leading-7 font-semibold', className)}
      data-slot="dialog-title"
      {...props}
    />
  )
}
