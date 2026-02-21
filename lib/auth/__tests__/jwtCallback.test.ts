import { faker } from '@faker-js/faker'

import { userFactory } from '@/test/factories'

import { jwtCallback } from '../jwtCallback'

describe('jwtCallback', () => {
  it('should return user data when it is present', async () => {
    const user = userFactory.build()
    const token = {
      email: user.email,
      sub: faker.string.alphanumeric({ casing: 'lower', length: 24 }),
    }
    const result = await jwtCallback({
      account: {
        provider: '123',
        providerAccountId: '123',
        type: 'credentials',
      },
      // @ts-expect-error: this matches what actually happens in production
      token,
      user,
    })
    expect(result).toEqual({
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      roles: user.roles,
      username: user.username,
    })
  })

  it('should return the token when the user is blank', async () => {
    const token = {
      ...userFactory.build(),
      exp: Math.floor(faker.date.future().getTime() / 1000),
      iat: faker.number.int(),
      jti: faker.string.alphanumeric({ casing: 'lower', length: 24 }),
      sub: faker.string.alphanumeric({ casing: 'lower', length: 24 }),
    }
    const result = await jwtCallback({
      account: {
        provider: '123',
        providerAccountId: '123',
        type: 'credentials',
      },
      token,
      // @ts-expect-error: the user is undefined after the first callback
      user: undefined,
    })
    expect(result).toEqual(token)
  })
})
