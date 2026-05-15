'use client'

import { type ComponentProps } from 'react'
import { Root, Thumb } from '@radix-ui/react-switch'
import type { VariantProps } from 'class-variance-authority'

import { SWITCH_THUMB_VARIANTS, SWITCH_TRACK_VARIANTS } from './constants'

type Extensions = ComponentProps<typeof Root> &
  VariantProps<typeof SWITCH_TRACK_VARIANTS>

type Props = Extensions & {
  size?: 'default' | 'sm'
}

export function Switch({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: Props) {
  return (
    <Root
      className={SWITCH_TRACK_VARIANTS({ className, variant })}
      data-size={size}
      data-slot="switch"
      data-variant={variant}
      {...props}
    >
      <Thumb
        className={SWITCH_THUMB_VARIANTS({ variant })}
        data-slot="switch-thumb"
      />
    </Root>
  )
}
