import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'
import { SetupServerApi } from 'msw/node'

import { SUCCESS } from '@/globals/constants'
import { User } from '@/prisma/generated/client'
import { ADMIN_USER, BASIC_USER } from '@/test/fixtures'

import { createJWTMock } from './createJWTMock'
import { getApiUrl } from './getApiUrl'

type Options = {
  body?: Record<string, unknown>
  message?: string
  role?: OneOf<User['roles']>
  signedIn?: boolean
  status?: number
}

export function mockAuthSessionResponse(
  server: SetupServerApi,
  options: Options = {},
) {
  const {
    body,
    role = 'USER',
    signedIn = true,
    status = SUCCESS,
  } = {
    ...options,
  }
  if (signedIn) {
    const expires = faker.date.future()
    const user = role === 'ADMIN' ? ADMIN_USER : BASIC_USER
    const token = createJWTMock(user, { exp: expires.getTime() / 1000 })
    server.use(
      http.get(getApiUrl('authSession'), () =>
        HttpResponse.json(
          { expires: expires.toISOString(), token, user, ...body },
          { status },
        ),
      ),
    )
    return { token, user }
  }

  server.use(
    http.get(getApiUrl('authSession'), () =>
      HttpResponse.json({}, { status: 200 }),
    ),
  )
  return { token: null, user: null }
}
