import { PaginationFacade } from '..'

const facade = new PaginationFacade()

describe('PaginationFacade', () => {
  it('should return all pages when totalPages is less than 7', () => {
    facade.update(0, 5)
    expect(facade.availablePages).toEqual([1, 2, 3, 4, 5])
  })

  it('should return all pages when totalPages is 7', () => {
    facade.update(0, 7)
    expect(facade.availablePages).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('should truncate with trailing ellipsis when at the first page of a large set', () => {
    facade.update(0, 10)
    expect(facade.availablePages).toEqual([1, 2, 3, 'ellipsis', 10])
  })

  it('should truncate with both ellipses when in the middle of a large set', () => {
    facade.update(4, 10)
    expect(facade.availablePages).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      'ellipsis',
      10,
    ])
  })

  it('should truncate with leading ellipsis when at the last page of a large set', () => {
    facade.update(9, 10)
    expect(facade.availablePages).toEqual([1, 'ellipsis', 8, 9, 10])
  })
})
