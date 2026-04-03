import { SummonError } from '@greenymcgee/summon'
import { renderHook } from '@testing-library/react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'

import {
  HTTP_TEXT_BY_STATUS,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
} from '@/globals/constants'
import { POSTS, POSTS_SECOND_PAGE } from '@/test/fixtures'
import { mockGetPostsResponse, postsServer } from '@/test/servers'

import { useGetPaginatedPostsQuery } from '..'

beforeAll(() => postsServer.listen())
afterEach(() => postsServer.resetHandlers())
afterAll(() => postsServer.close())

describe('useGetPaginatedPostsQuery', () => {
  it('should return an error when something goes wrong', async () => {
    const message = HTTP_TEXT_BY_STATUS[INTERNAL_SERVER_ERROR]
    const type = 'entity'
    mockGetPostsResponse({
      body: { type },
      message,
      status: INTERNAL_SERVER_ERROR,
    })
    const { result } = renderHook(() => useGetPaginatedPostsQuery())
    expect(await result.current).toEqual({
      data: null,
      error: new SummonError(message, {
        response: expect.objectContaining({
          data: { message, type },
          status: INTERNAL_SERVER_ERROR,
        }),
      }),
    })
  })

  it('should return posts and totalPages when the request succeeds', async () => {
    const { result } = renderHook(() => useGetPaginatedPostsQuery())
    expect(await result.current).toEqual({
      data: {
        message: HTTP_TEXT_BY_STATUS[SUCCESS],
        posts: POSTS.map((post) => ({
          authorId: post.authorId,
          content: post.content,
          createdAt: post.createdAt.toISOString(),
          id: post.id,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          title: post.title,
          updatedAt: post.updatedAt.toISOString(),
        })),
        totalPages: 10,
      },
      error: null,
    })
  })

  it('should utilize the page search param', async () => {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')
    vi.mocked(useSearchParams).mockReturnValueOnce(
      searchParams as ReadonlyURLSearchParams,
    )
    const { result } = renderHook(() => useGetPaginatedPostsQuery())
    expect(await result.current).toEqual({
      data: {
        message: HTTP_TEXT_BY_STATUS[SUCCESS],
        posts: POSTS_SECOND_PAGE.map((post) => ({
          authorId: post.authorId,
          content: post.content,
          createdAt: post.createdAt.toISOString(),
          id: post.id,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          title: post.title,
          updatedAt: post.updatedAt.toISOString(),
        })),
        totalPages: 10,
      },
      error: null,
    })
  })
})
