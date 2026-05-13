import { ZodError } from 'zod'

import { FindAndCountPostsDto } from '../find-and-count-posts.dto'

describe('FindAndCountPostsDto', () => {
  it('should throw an error for an invalid limit', () => {
    const result = new FindAndCountPostsDto({ limit: 'invalid' })
    expect(result).toEqual(
      expect.objectContaining({
        currentPage: 0,
        offset: 0,
        params: expect.any(ZodError),
      }),
    )
  })

  it('should throw an error for an invalid page', () => {
    const result = new FindAndCountPostsDto({ page: 'invalid' })
    expect(result).toEqual(
      expect.objectContaining({
        currentPage: 0,
        offset: 0,
        params: expect.any(ZodError),
      }),
    )
  })

  it('should throw an error for an invalid unpublished param', () => {
    const result = new FindAndCountPostsDto({ unpublished: 'invalid' })
    expect(result).toEqual(
      expect.objectContaining({
        currentPage: 0,
        offset: 0,
        params: expect.any(ZodError),
      }),
    )
  })

  it('should allow empty params', () => {
    const result = new FindAndCountPostsDto({})
    expect(result).toEqual(
      expect.objectContaining({
        currentPage: 0,
        offset: 0,
        params: { limit: 10, page: 0, unpublished: false },
      }),
    )
  })

  it('should allow valid params', () => {
    const limit = 20
    const page = 2
    const unpublished = true
    const offset = limit * page
    const result = new FindAndCountPostsDto({
      limit: String(limit),
      page: String(page),
      unpublished: String(unpublished),
    })
    expect(result).toEqual(
      expect.objectContaining({
        currentPage: offset / limit,
        offset,
        params: { limit, page, unpublished },
      }),
    )
  })
})
