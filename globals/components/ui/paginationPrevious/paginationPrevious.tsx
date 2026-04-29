import { ComponentProps } from 'react'
import { ChevronLeftIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { PaginationLink } from '../paginationLink'

type Props = ComponentProps<typeof PaginationLink> & { text?: string }

export function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: Props) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn('pl-2!', className)}
      size="default"
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}
