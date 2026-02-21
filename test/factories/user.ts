import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { User } from '@/prisma/generated/client'

export const userFactory = Factory.define<User>(({ params, sequence }) => ({
  createdAt: params.createdAt ?? faker.date.past(),
  email: params.email ?? faker.internet.email(),
  firstName: params.firstName ?? faker.person.firstName(),
  id: `user_${sequence}`,
  lastName: params.lastName ?? faker.person.lastName(),
  password: params.password ?? faker.internet.password(),
  roles: params.roles ?? ['USER'],
  updatedAt: params.updatedAt ?? faker.date.past(),
  username:
    params.username ??
    `${faker.animal.bear()}_${faker.book.author()}_${sequence}`,
}))
