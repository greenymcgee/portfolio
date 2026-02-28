import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock'

import { INTERNAL_SERVER_ERROR, ROUTES } from '@/constants'
import { UNPUBLISHED_POST } from '@/test/fixtures'
import { mockCookieHeader, renderWithProviders } from '@/test/helpers/utils'
import {
  mockPostsAuthSession,
  mockPostsCreateResponse,
  postsServer,
} from '@/test/servers'

import { CreatePostForm } from '..'

beforeAll(() => postsServer.listen())
beforeEach(() => {
  mockRouter.push(ROUTES.newPost)
  postsServer.resetHandlers()
})
afterAll(() => postsServer.close())

describe('<CreatePostForm />', () => {
  it('should redirect an unauthorized user', async () => {
    mockPostsAuthSession({ role: 'USER' })
    renderWithProviders(<CreatePostForm />)
    await waitFor(() => expect(mockRouter.pathname).toBe(ROUTES.home))
  })

  it('should render an error message when the POST request errors', async () => {
    await mockCookieHeader()
    mockPostsCreateResponse({ status: INTERNAL_SERVER_ERROR })
    renderWithProviders(<CreatePostForm />)
    await userEvent.type(screen.getByLabelText(/Title/), 'title')
    await userEvent.type(screen.getByLabelText('Content'), 'content')
    const submitButton = screen.getByTestId('submit-post-button')
    fireEvent.click(submitButton)
    await waitFor(() => expect(submitButton).not.toBeDisabled())
    expect(screen.getByTestId('error-message')).toBeVisible()
  })

  it('should render a form that calls the createPost action', async () => {
    await mockCookieHeader()
    renderWithProviders(<CreatePostForm />)
    await userEvent.type(screen.getByLabelText(/Title/), 'title')
    await userEvent.type(screen.getByLabelText('Content'), 'content')
    const submitButton = screen.getByTestId('submit-post-button')
    fireEvent.click(submitButton)
    await waitFor(() => expect(submitButton).not.toBeDisabled())
    expect(mockRouter.pathname).toBe(ROUTES.post(UNPUBLISHED_POST.id))
  })
})
