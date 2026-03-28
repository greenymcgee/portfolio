import { errAsync, okAsync } from 'neverthrow'

import { PostService } from '@/features/posts/post.service'
import {
  BAD_REQUEST,
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
} from '@/globals/constants'
import { createResponse } from '@/lib/db'
import { PUBLISHED_POST } from '@/test/fixtures'

import { GET } from '../route'

type FindOneReturn = Awaited<ReturnType<typeof PostService.findOne>>

let findOneSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  findOneSpy = vi.spyOn(PostService, 'findOne')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET:/api/posts/[id]', () => {
  it('should return an bad request response for an invalid id', async () => {
    const url = new URL('http://nothing.greeny/posts')
    const result = await GET(new Request(url), {
      params: Promise.resolve({ id: 'invalid' }),
    })
    expect(result).toEqual(
      createResponse({
        body: { type: 'dto' },
        message: expect.any(String),
        status: BAD_REQUEST,
        url: url.toString(),
      }),
    )
  })

  it('should return an expected status for a query error', async () => {
    const url = new URL('http://nothing.greeny')
    const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
    findOneSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindOneReturn,
    )
    const result = await GET(new Request(url), {
      params: Promise.resolve({ id: '1' }),
    })
    expect(result).toEqual(
      createResponse({
        body: { type: 'entity' },
        status: BAD_REQUEST,
        url: url.toString(),
      }),
    )
  })

  it('should return an internal server error response for any unexpected errors', async () => {
    const url = new URL('http://nothing.greeny')
    const error = { details: {}, status: 418 }
    findOneSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindOneReturn,
    )
    const result = await GET(new Request(url), {
      params: Promise.resolve({ id: '1' }),
    })
    expect(result).toEqual(
      createResponse({ status: INTERNAL_SERVER_ERROR, url: url.toString() }),
    )
  })

  it('should return a success response with the posts for a valid request', async () => {
    findOneSpy.mockResolvedValueOnce(
      okAsync({
        post: PUBLISHED_POST,
        status: SUCCESS,
      }) as unknown as FindOneReturn,
    )
    const request = new Request(new URL('http://nothing.greeny/api/posts'))
    const result = await GET(request, {
      params: Promise.resolve({ id: String(PUBLISHED_POST.id) }),
    })
    const json = await result.json()
    expect(json).toEqual({
      message: HTTP_TEXT_BY_STATUS[SUCCESS],
      post: JSON.parse(JSON.stringify(PUBLISHED_POST)),
    })
  })
})
