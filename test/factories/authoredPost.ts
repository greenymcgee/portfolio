import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { userFactory } from './user'

const DEFAULT_AUTHOR = userFactory.build()

export const authoredPostFactory = Factory.define<AuthoredPost>(
  ({ associations, params, sequence }) => ({
    author: associations.author ?? DEFAULT_AUTHOR,
    authorId: associations.authorId ?? DEFAULT_AUTHOR.id,
    content: params.content ?? {},
    createdAt: params.createdAt ?? faker.date.past(),
    description:
      params.description ??
      faker.lorem.sentence({ max: 25, min: 10 }).slice(0, 100),
    id: sequence,
    publishedAt: params.publishedAt ?? null,
    title:
      params.title ??
      `${faker.book.title()} ${faker.science.chemicalElement().name}`,
    updatedAt: params.updatedAt ?? faker.date.past(),
  }),
)
