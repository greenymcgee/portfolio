import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { Post } from '@/prisma/generated/client'

import { userFactory } from './user'

const DEFAULT_AUTHOR = userFactory.build()

export const postFactory = Factory.define<Post>(
  ({ associations, params, sequence }) => ({
    authorId: associations.authorId ?? DEFAULT_AUTHOR.id,
    content: params.content ?? {},
    createdAt: params.createdAt ?? faker.date.past(),
    id: sequence,
    publishedAt: params.publishedAt ?? null,
    title: params.title ?? faker.book.title(),
    updatedAt: params.updatedAt ?? faker.date.past(),
  }),
)
