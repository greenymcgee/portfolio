'use client'

import { type ComponentProps } from 'react'
import { Root } from '@radix-ui/react-label'

import { cn } from '@/lib/utils/index'

type Props = ComponentProps<typeof Root> & { required?: boolean }

export function Label({
  children,
  className,
  required = false,
  ...props
}: Props) {
  return (
    <Root
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none',
        'group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-50',
        className,
      )}
      data-slot="label"
      {...props}
    >
      {children}
      {required ? <span className="text-destructive -ml-1">*</span> : null}
    </Root>
  )
}
