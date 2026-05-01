import { useMemo } from 'react'

import {
  Pagination as PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/globals/components/ui'
import { ROUTES } from '@/globals/constants'
import { PaginationFacade } from '@/globals/facades'

type Props = {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: Props) {
  const facade = useMemo(() => new PaginationFacade(), [])
  const nextDisabled = currentPage === totalPages - 1
  const previousDisabled = currentPage === 0

  const pages = useMemo(() => {
    facade.update(currentPage, totalPages)
    return facade.availablePages
  }, [currentPage, facade, totalPages])

  if (totalPages <= 1) return null

  return (
    <PaginationNav aria-label="Posts pagination" className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={previousDisabled}
            href={`${ROUTES.posts}?page=${currentPage - 1}`}
          />
        </PaginationItem>
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href={`${ROUTES.posts}?page=${page - 1}`}
                isActive={page - 1 === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            disabled={nextDisabled}
            href={`${ROUTES.posts}?page=${currentPage + 1}`}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationNav>
  )
}
