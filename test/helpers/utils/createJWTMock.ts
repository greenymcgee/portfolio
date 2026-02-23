import { faker } from '@faker-js/faker'
import { JWT } from 'next-auth/jwt'

import { User } from '@/prisma/generated/client'

type Options = Partial<JWT>

export function createJWTMock(user: User, options?: Options) {
  return {
    ...user,
    exp: faker.date.future().getTime() / 1000,
    iat: faker.number.int(),
    jti: faker.string.alphanumeric({ length: 24 }),
    sub: faker.string.alphanumeric({ length: 24 }),
    ...options,
  }
}
