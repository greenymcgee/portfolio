import { ZodError } from 'zod'

import { FindPostDto } from '../find-post.dto'

describe('FindPostDto', () => {
  it('should throw an error for a missing id', async () => {
    // @ts-expect-error: need to test validation
    const result = new FindPostDto({ params: Promise.resolve({}) })
    expect(await result.getId()).toEqual(expect.any(ZodError))
  })

  it('should throw an error for an invalid id', async () => {
    const result = new FindPostDto({
      params: Promise.resolve({ id: 'invalid' }),
    })
    expect(await result.getId()).toEqual(expect.any(ZodError))
  })

  it('should allow a valid id', async () => {
    const result = new FindPostDto({ params: Promise.resolve({ id: '1' }) })
    expect(await result.getId()).toEqual(1)
  })
})
