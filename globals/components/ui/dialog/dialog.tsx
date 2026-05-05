'use client'

import { ComponentProps } from 'react'
import { Root } from '@radix-ui/react-dialog'

export function Dialog({ ...props }: ComponentProps<typeof Root>) {
  return <Root data-slot="dialog" {...props} />
}
