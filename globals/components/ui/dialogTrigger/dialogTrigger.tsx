'use client'

import { ComponentProps } from 'react'
import { Trigger } from '@radix-ui/react-dialog'

export function DialogTrigger({ ...props }: ComponentProps<typeof Trigger>) {
  return <Trigger data-slot="dialog-trigger" {...props} />
}
