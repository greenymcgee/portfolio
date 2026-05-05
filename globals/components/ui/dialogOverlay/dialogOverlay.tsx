'use client'

import { ComponentProps } from 'react'
import { Overlay } from '@radix-ui/react-dialog'

import { cn } from '@/lib/utils'

export function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof Overlay>) {
  return (
    <Overlay
      className={cn(
        'data-open:animate-in data-open:fade-in-0 data-closed:animate-out',
        'data-closed:fade-out-0 fixed inset-0 isolate z-50',
        'bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs',
        className,
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  )
}
