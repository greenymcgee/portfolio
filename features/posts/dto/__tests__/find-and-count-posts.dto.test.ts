import { ZodError } from 'zod'

import { FindAndCountPostsDto } from '../find-and-count-posts.dto'

describe('FindAndCountPostsDto', () => {
  it('should throw an error for an invalid limit', () => {
    const result = new FindAndCountPostsDto(
      new Request('http://greeny.no/posts?limit=invalid'),
    )
    expect(result.params).toEqual(expect.any(ZodError))
  })

  it('should throw an error for an invalid page', () => {
    const result = new FindAndCountPostsDto(
      new Request('http://greeny.no/posts?page=invalid'),
    )
    expect(result.params).toEqual(expect.any(ZodError))
  })

  it('should allow valid params', () => {
    const limit = 10
    const page = 2
    const result = new FindAndCountPostsDto(
      new Request(`http://greeny.no/posts?limit=${limit}&page=${page}`),
    )
    expect(result.params).toEqual({ limit: 10, offset: limit * page })
  })
})
