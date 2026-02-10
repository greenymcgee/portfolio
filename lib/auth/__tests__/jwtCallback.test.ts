import { userFactory } from '@/test/factories'

import { jwtCallback } from '../jwtCallback'

describe('jwtCallback', () => {
  it('should return the token and the token id when it is present', async () => {
    const result = await jwtCallback({
      account: {
        provider: '123',
        providerAccountId: '123',
        type: 'credentials',
      },
      token: { email: 'email', id: 'token-id' },
      user: userFactory.build(),
    })
    expect(result).toEqual({ email: 'email', id: 'token-id' })
  })

  it('should return the token and the user id when the token id is blank', async () => {
    const user = userFactory.build()
    const result = await jwtCallback({
      account: {
        provider: '123',
        providerAccountId: '123',
        type: 'credentials',
      },
      // @ts-expect-error: testing against undefined for extra caution
      token: { email: 'email', id: undefined },
      user,
    })
    expect(result).toEqual({ email: 'email', id: user.id })
  })
})
