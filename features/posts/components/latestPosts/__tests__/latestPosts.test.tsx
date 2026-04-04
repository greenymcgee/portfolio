import { act, render, screen } from '@testing-library/react'

import { INTERNAL_SERVER_ERROR, ROUTES } from '@/globals/constants'
import { POSTS } from '@/test/fixtures'
import { mockGetPostsResponse, postsServer } from '@/test/servers'

import { LatestPosts } from '..'

beforeAll(() => postsServer.listen())
afterEach(() => postsServer.resetHandlers())
afterAll(() => postsServer.close())

describe('<LatestPosts />', () => {
  it('should render a message to the user upon failure', async () => {
    mockGetPostsResponse({ status: INTERNAL_SERVER_ERROR })
    await act(() => render(<LatestPosts />))
    expect(await screen.findByTestId('latest-posts-error')).toBeVisible()
  })

  it('should render links to post pages', async () => {
    await act(() => render(<LatestPosts />))
    await screen.findByTestId(`card-${POSTS.at(0)?.id}`)
    POSTS.forEach(({ id, title }) => {
      expect(screen.getByRole('link', { name: title })).toHaveAttribute(
        'href',
        ROUTES.post(id),
      )
    })
  })
})
