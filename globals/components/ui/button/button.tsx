import { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Spinner } from '../spinner'
import { BUTTON_VARIANTS } from './constants'

type Props = ComponentProps<'button'> &
  VariantProps<typeof BUTTON_VARIANTS> & {
    asChild?: boolean
    loading?: boolean
  }

export function Button({
  asChild = false,
  className,
  children,
  loading,
  size = 'default',
  type = asChild ? undefined : 'button',
  variant = 'default',
  ...props
}: Props) {
  if (loading && asChild) {
    // TODO: redirect developer to Link when that component exists
    throw new Error('loading prop not allowed when asChild prop is true')
  }

  const Tag = asChild ? Slot : 'button'

  return (
    <Tag
      className={cn(BUTTON_VARIANTS({ className, size, variant }))}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      type={type}
      {...props}
    >
      {loading ? (
        <>
          {children} <Spinner />
        </>
      ) : (
        children
      )}
    </Tag>
  )
}
