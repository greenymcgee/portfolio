import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type Props = ComponentProps<'ul'>

export function PaginationContent({ className, ...props }: Props) {
  return (
    <ul
      className={cn('flex items-center gap-1', className)}
      data-slot="pagination-content"
      {...props}
    />
  )
}
