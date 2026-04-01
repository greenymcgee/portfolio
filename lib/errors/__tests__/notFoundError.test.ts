import { NotFoundError } from '../notFoundError'

describe('NotFoundError', () => {
  it('should return a message', () => {
    expect(new NotFoundError(1, 'Post').message).toBe(
      'Post: 1 could not be found',
    )
  })
})
