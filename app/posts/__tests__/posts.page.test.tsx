import { render, screen } from '@testing-library/react'

import { postsServer } from '@/test/servers'

import PostsPage from '../page'

beforeAll(() => postsServer.listen())
afterEach(() => postsServer.resetHandlers())
afterAll(() => postsServer.close())

describe('PostsPage', () => {
  it('should render an h1', () => {
    render(<PostsPage />)
    expect(screen.getByTestId('posts-page-heading').tagName).toBe('H1')
  })

  it('should render the latest posts', () => {
    render(<PostsPage />)
    expect(screen.getByTestId('latest-posts')).toBeVisible()
  })
})
