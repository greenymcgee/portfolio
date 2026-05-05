'use client'

import { ComponentProps } from 'react'
import { Close } from '@radix-ui/react-dialog'

import { cn } from '@/lib/utils'

import { Button } from '../button'

type Props = ComponentProps<'div'> & {
  showCloseButton?: boolean
}

export function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      data-slot="dialog-footer"
      {...props}
    >
      {children}
      {showCloseButton ? (
        <Close asChild>
          <Button variant="outline">Close</Button>
        </Close>
      ) : null}
    </div>
  )
}
