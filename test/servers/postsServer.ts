import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { CREATED, HTTP_TEXT_BY_STATUS, SUCCESS } from '@/globals/constants'
import { User } from '@/prisma/generated/client'

import { ADMIN_USER, UNPUBLISHED_POST } from '../fixtures'
import {
  createJWTMock,
  getApiUrl,
  mockAuthSessionResponse,
} from '../helpers/utils'

type ResponseOptions = {
  body?: Record<string, unknown>
  message?: string
  role?: OneOf<User['roles']>
  signedIn?: boolean
  status?: number
}

const EXPIRES = faker.date.future()
const TOKEN = createJWTMock(ADMIN_USER, { exp: EXPIRES.getTime() / 1000 })

const handlers = [
  http.post(getApiUrl('posts'), () =>
    HttpResponse.json(
      { message: HTTP_TEXT_BY_STATUS[CREATED], post: UNPUBLISHED_POST },
      { status: CREATED },
    ),
  ),
  http.get(getApiUrl('authSession'), () =>
    HttpResponse.json(
      { expires: EXPIRES.toISOString(), token: TOKEN, user: ADMIN_USER },
      { status: SUCCESS },
    ),
  ),
  http.post(getApiUrl('authLog'), () => HttpResponse.json({ status: SUCCESS })),
]

export const postsServer = setupServer(...handlers)

export function mockPostsCreateResponse(options: ResponseOptions = {}) {
  const {
    body,
    message = HTTP_TEXT_BY_STATUS[CREATED],
    status = CREATED,
  } = {
    ...options,
  }
  postsServer.use(
    http.post(getApiUrl('posts'), () =>
      HttpResponse.json({ message, ...body }, { status }),
    ),
  )
}

export function mockPostsAuthSession(
  options?: SecondParameterOf<typeof mockAuthSessionResponse>,
) {
  mockAuthSessionResponse(postsServer, options)
}
