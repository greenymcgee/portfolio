const ELLIPSIS = 'ellipsis' as const

export class PaginationFacade {
  private currentPage: number = 0

  private totalPages: number = 0

  public get availablePages() {
    if (this.totalPages <= 7) return this.pagesWithoutEllipsis

    return [
      1,
      ...(this.hasLeadingGap ? [ELLIPSIS] : []),
      ...this.pageRangeWithoutPageOne,
      ...(this.hasTrailingGap ? [ELLIPSIS] : []),
      ...(this.lastPageMissing ? [this.totalPages] : []),
    ]
  }

  public update(currentPage: number, totalPages: number) {
    this.currentPage = currentPage
    this.totalPages = totalPages
  }

  private get hasLeadingGap() {
    return this.pageRangeStart > 1
  }

  private get hasTrailingGap() {
    return this.pageRangeEnd < this.totalPages - 2
  }

  private get lastPageMissing() {
    return this.pageRangeEnd < this.totalPages - 1
  }

  private mapSlotToPageRange = (_: number, index: number) => {
    return this.pageRangeStart + index + 1
  }

  private get pagesWithoutEllipsis() {
    return Array.from(Array(this.totalPages), (_, index) => index + 1)
  }

  private get pageRangeEnd() {
    return Math.min(this.totalPages - 1, Math.max(this.currentPage + 1, 2))
  }

  private get pageRangeStart() {
    return Math.max(0, Math.min(this.currentPage - 1, this.totalPages - 3))
  }

  private get pagesWithinRange() {
    return Array(this.pageRangeEnd - this.pageRangeStart + 1)
  }

  private get pageRange() {
    return Array.from(this.pagesWithinRange, this.mapSlotToPageRange)
  }

  /**
   * The first page is hard-coded in the array.
   */
  private get pageRangeWithoutPageOne() {
    return this.pageRange.filter((page) => page !== 1)
  }
}
