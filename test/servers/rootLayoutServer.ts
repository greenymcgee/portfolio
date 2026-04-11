import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { SUCCESS } from '@/globals/constants'

import { ADMIN_USER } from '../fixtures'
import {
  createJWTMock,
  getApiUrl,
  mockAuthSessionResponse,
} from '../helpers/utils'

const EXPIRES = faker.date.future()
const TOKEN = createJWTMock(ADMIN_USER, { exp: EXPIRES.getTime() / 1000 })

const handlers = [
  http.get(getApiUrl('authCsrf'), () =>
    HttpResponse.json({ csrfToken: 'test-csrf-token' }),
  ),
  http.get(getApiUrl('authSession'), () =>
    HttpResponse.json(
      { expires: EXPIRES.toISOString(), token: TOKEN, user: ADMIN_USER },
      { status: SUCCESS },
    ),
  ),
  http.post(getApiUrl('authLog'), () => HttpResponse.json({ status: SUCCESS })),
  http.post(getApiUrl('authSignout'), () => HttpResponse.json({})),
]

export const rootLayoutServer = setupServer(...handlers)

export function mockRootLayoutAuthSession(
  options: SecondParameterOf<typeof mockAuthSessionResponse> = {},
) {
  return mockAuthSessionResponse(rootLayoutServer, options)
}
