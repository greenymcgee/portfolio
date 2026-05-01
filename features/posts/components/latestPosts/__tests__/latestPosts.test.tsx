import { render, screen } from '@testing-library/react'
import { errAsync, okAsync } from 'neverthrow'

import { PostService } from '@/features/posts/post.service'
import { BAD_REQUEST, SUCCESS } from '@/globals/constants'
import { POSTS } from '@/test/fixtures'

import { LatestPosts } from '..'

type FindAndCountReturn = Awaited<ReturnType<typeof PostService.findAndCount>>

const PROPS: PropsOf<typeof LatestPosts> = {
  searchParams: Promise.resolve({ page: '0' }),
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('<LatestPosts />', () => {
  it('should render PostCards', async () => {
    vi.spyOn(PostService, 'findAndCount').mockResolvedValue(
      okAsync({
        currentPage: 0,
        posts: POSTS,
        status: SUCCESS,
        totalPages: 1,
      }) as unknown as FindAndCountReturn,
    )
    const jsx = await LatestPosts(PROPS)
    render(jsx)
    POSTS.forEach(({ id }) => {
      expect(screen.getByTestId(`card-${id}`)).toBeVisible()
    })
  })

  it('should render the error message on failure', async () => {
    vi.spyOn(PostService, 'findAndCount').mockResolvedValueOnce(
      errAsync({
        details: {},
        status: BAD_REQUEST,
        type: 'entity',
      }) as unknown as FindAndCountReturn,
    )
    const jsx = await LatestPosts(PROPS)
    render(jsx)
    expect(screen.getByTestId('latest-posts-error')).toBeVisible()
  })

  it('should render pagination', async () => {
    vi.spyOn(PostService, 'findAndCount').mockResolvedValueOnce(
      okAsync({
        currentPage: 0,
        posts: POSTS,
        status: SUCCESS,
        totalPages: 3,
      }) as unknown as FindAndCountReturn,
    )
    const jsx = await LatestPosts(PROPS)
    render(jsx)
    expect(
      screen.getByRole('navigation', { name: /posts pagination/i }),
    ).toBeVisible()
  })
})
