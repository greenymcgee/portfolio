import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { toast } from 'sonner'

import { PostRepository } from '@/features/posts/post.repository'
import { PrismaError } from '@/lib/errors'
import { UNPUBLISHED_POST } from '@/test/fixtures'
import { mockServerSession, renderWithProviders } from '@/test/helpers/utils'

import { NewPostForm } from '..'

afterEach(() => vi.restoreAllMocks())

describe('<NewPostForm />', () => {
  it('should render a button to create a new post', () => {
    renderWithProviders(<NewPostForm />)
    expect(screen.getByTestId('new-post-form')).toBeVisible()
    expect(screen.getByRole('button', { name: /New Post/ })).toBeEnabled()
  })

  it('should disable the button and show a loading spinner while the request is pending', async () => {
    mockServerSession('ADMIN')
    vi.spyOn(PostRepository, 'create').mockResolvedValueOnce(UNPUBLISHED_POST)
    renderWithProviders(<NewPostForm />)
    fireEvent.click(screen.getByRole('button', { name: /New Post/ }))
    expect(screen.getByRole('status')).toBeVisible()
    expect(screen.getByRole('button', { name: /New Post/ })).toBeDisabled()
    await waitForElementToBeRemoved(screen.getByRole('status'))
  })

  it('should toast an error message when the create post request fails', async () => {
    mockServerSession('ADMIN')
    vi.spyOn(PostRepository, 'create').mockResolvedValueOnce(
      new PrismaError(new Error('Internal Server Error')),
    )
    const toastErrorSpy = vi.spyOn(toast, 'error').mockReturnValue('toast-id')
    renderWithProviders(<NewPostForm />)
    fireEvent.click(screen.getByRole('button', { name: /New Post/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(toastErrorSpy).toHaveBeenCalledWith('Something went wrong')
  })
})
