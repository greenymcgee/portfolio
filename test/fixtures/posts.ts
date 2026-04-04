/* eslint-disable sort-keys */
import { faker } from '@faker-js/faker'

import { postFactory } from '../factories'
import { ADMIN_USER } from './users'

const CONTENT = JSON.stringify({
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
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

function getDate(index: number) {
  if (index === 3 || index === 7) return null

  if (index === 2) return faker.date.future()

  return faker.date.past()
}

export const UNPUBLISHED_POST = postFactory
  .associations({ authorId: ADMIN_USER.id })
  .build({
    content: CONTENT,
    publishedAt: null,
  })
export const PUBLISHED_POST = postFactory
  .associations({ authorId: ADMIN_USER.id })
  .build({
    content: CONTENT,
    publishedAt: faker.date.past(),
  })
export const WILL_BE_PUBLISHED_POST = postFactory
  .associations({ authorId: ADMIN_USER.id })
  .build({
    content: CONTENT,
    publishedAt: faker.date.future(),
  })

const GENERATED_POSTS = Array.from(Array(15)).map((_, index) => {
  return postFactory.associations({ authorId: ADMIN_USER.id }).build({
    content: CONTENT,
    publishedAt: getDate(index),
  })
})

export const POSTS = [
  PUBLISHED_POST,
  UNPUBLISHED_POST,
  WILL_BE_PUBLISHED_POST,
  ...GENERATED_POSTS,
]

export const POSTS_SECOND_PAGE = postFactory.buildList(3)

/* eslint-enable sort-keys */
