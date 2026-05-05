'use client'

import { ComponentProps } from 'react'
import { Close, Content } from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '../button'
import { DialogOverlay } from '../dialogOverlay'
import { DialogPortal } from '../dialogPortal'

type Props = ComponentProps<typeof Content> & {
  showCloseButton?: boolean
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Props) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <Content
        className={cn(
          'bg-popover text-popover-foreground ring-foreground/10',
          'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
          'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)]',
          '-translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl p-6 text-sm ring-1',
          'duration-100 outline-none sm:max-w-md',
          className,
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
        {showCloseButton ? (
          <Close asChild data-slot="dialog-close">
            <Button
              className="absolute top-4 right-4"
              size="icon-sm"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </Close>
        ) : null}
      </Content>
    </DialogPortal>
  )
}
