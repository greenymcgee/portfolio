'use client'

import { ComponentProps } from 'react'
import { Portal } from '@radix-ui/react-dialog'

export function DialogPortal({ ...props }: ComponentProps<typeof Portal>) {
  return <Portal data-slot="dialog-portal" {...props} />
}
