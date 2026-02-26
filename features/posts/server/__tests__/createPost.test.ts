import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'

import {
  FORBIDDEN,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  ROUTES,
  UNAUTHORIZED,
} from '@/constants'
import { UNPUBLISHED_POST } from '@/test/fixtures'
import { mockPostsCreateResponse, postsServer } from '@/test/servers'

import { createPost } from '..'

beforeAll(() => postsServer.listen())
afterEach(() => {
  vi.clearAllMocks()
  postsServer.resetHandlers()
})
afterAll(() => postsServer.close())

const FORM_DATA = new FormData()
FORM_DATA.set('content', '{}')
FORM_DATA.set('title', 'Title')

describe('createPost', () => {
  it('should return a Zod validation error', async () => {
    const result = await createPost({ status: 'IDLE' }, new FormData())
    expect(result).toEqual({
      content: null,
      error: expect.any(ZodError),
      publishedAt: null,
      status: 'ERROR',
      title: null,
    })
  })

  it('should redirect to the login page when the cookie is not set', async () => {
    await createPost({ status: 'IDLE' }, FORM_DATA)
    expect(redirect).toHaveBeenCalledWith(ROUTES.login)
  })

  it('should redirect to the login page when the response is unauthorized', async () => {
    const { get } = await headers()
    vi.mocked(get).mockReturnValue('cookie')
    mockPostsCreateResponse({
      message: HTTP_TEXT_BY_STATUS[UNAUTHORIZED],
      status: UNAUTHORIZED,
    })
    await createPost({ status: 'IDLE' }, FORM_DATA)
    expect(redirect).toHaveBeenCalledWith(ROUTES.login)
  })

  it('should redirect to the home page when the response is forbidden', async () => {
    const { get } = await headers()
    vi.mocked(get).mockReturnValue('cookie')
    mockPostsCreateResponse({
      message: HTTP_TEXT_BY_STATUS[FORBIDDEN],
      status: FORBIDDEN,
    })
    await createPost({ status: 'IDLE' }, FORM_DATA)
    expect(redirect).toHaveBeenCalledWith(ROUTES.home)
  })

  it('should return the error status and the formValues when an unknown error occurs', async () => {
    const { get } = await headers()
    vi.mocked(get).mockReturnValue('cookie')
    mockPostsCreateResponse({
      message: HTTP_TEXT_BY_STATUS[INTERNAL_SERVER_ERROR],
      status: INTERNAL_SERVER_ERROR,
    })
    const result = await createPost({ status: 'IDLE' }, FORM_DATA)
    expect(result).toEqual({
      content: FORM_DATA.get('content'),
      publishedAt: FORM_DATA.get('publishedAt'),
      status: 'ERROR',
      title: FORM_DATA.get('title'),
    })
  })

  it('should redirect to the post page upon success', async () => {
    const { get } = await headers()
    vi.mocked(get).mockReturnValue('cookie')
    await createPost({ status: 'IDLE' }, FORM_DATA)
    expect(redirect).toHaveBeenCalledWith(ROUTES.post(UNPUBLISHED_POST.id))
  })
})
