import { faker } from '@faker-js/faker'

import { postFactory } from '../factories'
import { ADMIN_USER } from './users'

const CONTENT = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: faker.lorem.paragraph(),
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

function getDate(index: number) {
  if (index === 3 || index === 7) return null

  if (index === 2) return faker.date.future()

  return faker.date.past()
}

const UNPUBLISHED_POST = postFactory
  .associations({ authorId: ADMIN_USER.id })
  .build({
    content: CONTENT,
    publishedAt: null,
    title: faker.book.title(),
  })
const PUBLISHED_POST = postFactory
  .associations({ authorId: ADMIN_USER.id })
  .build({
    content: CONTENT,
    publishedAt: faker.date.past(),
    title: faker.book.title(),
  })
const WILL_BE_PUBLISHED_POST = postFactory
  .associations({ authorId: ADMIN_USER.id })
  .build({
    content: CONTENT,
    publishedAt: faker.date.future(),
    title: faker.book.title(),
  })

const GENERATED_POSTS = Array.from(Array(15)).map((_, index) => {
  return postFactory.associations({ authorId: ADMIN_USER.id }).build({
    content: CONTENT,
    publishedAt: getDate(index),
    title: faker.book.title(),
  })
})

export const POSTS = [
  PUBLISHED_POST,
  UNPUBLISHED_POST,
  WILL_BE_PUBLISHED_POST,
  ...GENERATED_POSTS,
]
