'use client'

import { ComponentProps } from 'react'
import { Description } from '@radix-ui/react-dialog'

import { cn } from '@/lib/utils'

type Props = ComponentProps<typeof Description>

export function DialogDescription({ className, ...props }: Props) {
  return (
    <Description
      className={cn(
        'text-muted-foreground',
        '*:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3',
        className,
      )}
      data-slot="dialog-description"
      {...props}
    />
  )
}
