import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/helpers/utils'
import { postsServer } from '@/test/servers'

import NewPostPage from '../page'

beforeAll(() => postsServer.listen())
afterEach(() => postsServer.resetHandlers())
afterAll(() => postsServer.close())

describe('<NewPostPage />', () => {
  it('should render an h1', () => {
    renderWithProviders(<NewPostPage />)
    expect(screen.getByTestId('create-post-heading').tagName).toBe('H1')
  })

  it('should render the CreatePostForm', () => {
    renderWithProviders(<NewPostPage />)
    expect(screen.getByTestId('create-post-form')).toBeVisible()
  })
})
