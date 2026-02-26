import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { CREATED, HTTP_TEXT_BY_STATUS } from '@/constants'

import { UNPUBLISHED_POST } from '../fixtures'
import { getApiUrl } from '../helpers/utils'

const handlers = [
  http.post(getApiUrl('posts'), () =>
    HttpResponse.json(
      { message: HTTP_TEXT_BY_STATUS[CREATED], post: UNPUBLISHED_POST },
      { status: CREATED },
    ),
  ),
]

export const postsServer = setupServer(...handlers)

export function mockPostsCreateResponse(
  options: {
    body?: Record<string, unknown>
    message?: string
    status?: number
  } = {},
) {
  const {
    body,
    message = HTTP_TEXT_BY_STATUS[CREATED],
    status = 201,
  } = {
    ...options,
  }
  postsServer.use(
    http.post(getApiUrl('posts'), () =>
      HttpResponse.json({ message, ...body }, { status }),
    ),
  )
}
