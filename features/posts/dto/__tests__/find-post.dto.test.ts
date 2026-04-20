import { ZodError } from 'zod'

import { FindPostDto } from '../find-post.dto'

describe('FindPostDto', () => {
  it('should throw an error for a missing id', () => {
    // @ts-expect-error: need to test validation
    const { id } = new FindPostDto(undefined)
    expect(id).toEqual(expect.any(ZodError))
  })

  it('should throw an error for an invalid id', () => {
    const { id } = new FindPostDto(0)
    expect(id).toEqual(expect.any(ZodError))
  })

  it('should allow a valid id', () => {
    const { id } = new FindPostDto(1)
    expect(id).toEqual(1)
  })
})
