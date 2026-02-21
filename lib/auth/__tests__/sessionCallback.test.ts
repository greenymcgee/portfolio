import { faker } from '@faker-js/faker'
import { Session } from 'next-auth'

import { userFactory } from '@/test/factories'

import { sessionCallback } from '../sessionCallback'

describe('sessionCallback', () => {
  it('should return the session.expires and populate the user with the token', async () => {
    const user = userFactory.build()
    const session = {
      expires: faker.date.future().toISOString(),
      user: { email: user.email },
    } as Session
    const token = {
      ...user,
      exp: Math.floor(faker.date.future().getTime() / 1000),
      iat: faker.number.int(),
      jti: faker.string.alphanumeric({ casing: 'lower', length: 24 }),
      sub: faker.string.alphanumeric({ casing: 'lower', length: 24 }),
    }
    const result = await sessionCallback({
      newSession: '',
      session,
      token,
      trigger: 'update',
      user: { ...session.user, emailVerified: new Date() },
    })
    expect(result).toEqual({
      expires: session.expires,
      token,
      user: {
        email: session.user.email,
        firstName: token.firstName,
        id: token.id,
        lastName: token.lastName,
        roles: token.roles,
        username: token.username,
      },
    })
  })
})
