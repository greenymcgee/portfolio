import { errAsync, okAsync } from 'neverthrow'

import * as postServices from '@/features/posts/services'
import {
  BAD_REQUEST,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  SUCCESS,
} from '@/globals/constants'
import { POSTS } from '@/test/fixtures'

import { GET } from '../route'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('GET:/api/posts/', () => {
  it('should return an bad request response for invalid params', async () => {
    const params = new URLSearchParams()
    params.append('page', 'page not a number')
    params.append('limit', 'limit not a number')
    const result = await GET(
      new Request(new URL(`http://nothing.greeny?${params}`)),
    )
    expect(result.status).toEqual(BAD_REQUEST)
  })

  it('should return an expected status for a query error', async () => {
    const error = { details: {}, status: BAD_REQUEST, type: 'query' }
    vi.spyOn(postServices, 'GetPostsService').mockImplementationOnce(
      class {
        getPosts = () => errAsync(error)
      } as unknown as typeof postServices.GetPostsService,
    )
    const result = await GET(new Request(new URL('http://nothing.greeny')))
    expect(result.status).toEqual(BAD_REQUEST)
  })

  it('should return an expected status for a count error', async () => {
    const error = { details: {}, status: NOT_FOUND, type: 'count' }
    vi.spyOn(postServices, 'GetPostsService').mockImplementationOnce(
      class {
        getPosts = () => errAsync(error)
      } as unknown as typeof postServices.GetPostsService,
    )
    const result = await GET(new Request(new URL('http://nothing.greeny')))
    expect(result.status).toEqual(NOT_FOUND)
  })

  it('should return an internal server error response for any unexpected errors', async () => {
    const error = { details: {}, status: 418 }
    vi.spyOn(postServices, 'GetPostsService').mockImplementationOnce(
      class {
        getPosts = () => errAsync(error)
      } as unknown as typeof postServices.GetPostsService,
    )
    const result = await GET(new Request(new URL('http://nothing.greeny')))
    expect(result.status).toEqual(INTERNAL_SERVER_ERROR)
  })

  it('should return a success response with the posts for a valid request', async () => {
    const totalPages = 10
    vi.spyOn(postServices, 'GetPostsService').mockImplementationOnce(
      class {
        getPosts = () => okAsync({ posts: POSTS, status: SUCCESS, totalPages })
      } as unknown as typeof postServices.GetPostsService,
    )
    const request = new Request(new URL('http://nothing.greeny/api/posts'))
    const result = await GET(request)
    const json = await result.json()
    expect(json).toEqual({
      message: HTTP_TEXT_BY_STATUS[SUCCESS],
      posts: JSON.parse(JSON.stringify(POSTS)),
      totalPages,
    })
  })
})
