import { ZodError } from 'zod'

import { FindPostDto } from '../find-post.dto'

describe('FindPostDto', () => {
  it('should return an error for a missing id', () => {
    const { params } = new FindPostDto({ id: undefined as unknown as number })
    expect(params).toEqual(expect.any(ZodError))
  })

  it('should return an error for an invalid id', () => {
    const { params } = new FindPostDto({ id: 0 })
    expect(params).toEqual(expect.any(ZodError))
  })

  it('should allow a valid id', () => {
    const { params } = new FindPostDto({ id: 1 })
    expect(params).toEqual({ id: 1 })
  })
})
