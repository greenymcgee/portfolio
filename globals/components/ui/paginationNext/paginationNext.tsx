import { ComponentProps } from 'react'
import { ChevronRightIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { PaginationLink } from '../paginationLink'

type Props = ComponentProps<typeof PaginationLink> & { text?: string }

export function PaginationNext({ className, text = 'Next', ...props }: Props) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn('pr-2!', className)}
      size="default"
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}
