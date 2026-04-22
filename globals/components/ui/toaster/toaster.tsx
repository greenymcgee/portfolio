'use client'

import { CSSProperties } from 'react'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { cn } from '@/lib/utils'

export function Toaster({
  className,
  position = 'top-center',
  style,
  toastOptions,
  ...props
}: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      className={cn('toaster group', className)}
      data-testid="toaster"
      icons={{
        error: <OctagonXIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        success: <CircleCheckIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
      }}
      position={position}
      style={
        {
          '--border-radius': 'var(--radius)',
          '--normal-bg': 'var(--popover)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--popover-foreground)',
          ...style,
        } as CSSProperties
      }
      theme={theme as ToasterProps['theme']}
      toastOptions={{ classNames: { toast: 'cn-toast' }, ...toastOptions }}
      {...props}
    />
  )
}
