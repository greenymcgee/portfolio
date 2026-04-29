import { ComponentProps } from 'react'
import { MoreHorizontalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type Props = ComponentProps<'span'>

export function PaginationEllipsis({ className, ...props }: Props) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  )
}
