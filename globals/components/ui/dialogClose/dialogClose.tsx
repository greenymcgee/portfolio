'use client'

import { ComponentProps } from 'react'
import { Close } from '@radix-ui/react-dialog'

export function DialogClose({ ...props }: ComponentProps<typeof Close>) {
  return <Close data-slot="dialog-close" {...props} />
}
