import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { toast } from 'sonner'

import * as postActions from '@/features/posts/actions'
import type { TogglePostPublishedState } from '@/features/posts/types'
import { PUBLISHED_POST, UNPUBLISHED_POST } from '@/test/fixtures'
import { renderWithProviders } from '@/test/helpers/utils'

import { TogglePostPublishedForm } from '../togglePostPublishedForm'

afterEach(() => vi.restoreAllMocks())

describe('<TogglePostPublishedForm />', () => {
  it('should render a Publish button when the post is unpublished', () => {
    renderWithProviders(<TogglePostPublishedForm post={UNPUBLISHED_POST} />)
    expect(screen.getByRole('button', { name: /Publish/ })).toBeEnabled()
  })

  it('should render an Unpublish button when the post is published', () => {
    renderWithProviders(<TogglePostPublishedForm post={PUBLISHED_POST} />)
    expect(screen.getByRole('button', { name: /Unpublish/ })).toBeEnabled()
  })

  it('should disable the button while the request is pending', () => {
    vi.spyOn(postActions, 'togglePostPublished').mockResolvedValueOnce({
      id: UNPUBLISHED_POST.id,
      publishedAt: UNPUBLISHED_POST.publishedAt,
      status: 'IDLE',
    } as TogglePostPublishedState)
    renderWithProviders(<TogglePostPublishedForm post={UNPUBLISHED_POST} />)
    fireEvent.click(screen.getByRole('button', { name: /Publish/ }))
    expect(screen.getByRole('button', { name: /Publish/ })).toBeDisabled()
  })

  it('should toast a success message when unpublishing succeeds', async () => {
    vi.spyOn(postActions, 'togglePostPublished').mockResolvedValueOnce({
      id: PUBLISHED_POST.id,
      publishedAt: null,
      status: 'SUCCESS',
    } as TogglePostPublishedState)
    const toastSuccessSpy = vi
      .spyOn(toast, 'success')
      .mockReturnValue('toast-id')
    renderWithProviders(<TogglePostPublishedForm post={PUBLISHED_POST} />)
    fireEvent.click(screen.getByRole('button', { name: /Unpublish/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(toastSuccessSpy).toHaveBeenCalledWith(
      `${PUBLISHED_POST.title} has been unpublished`,
    )
  })

  it('should toast an error message when unpublishing fails', async () => {
    vi.spyOn(postActions, 'togglePostPublished').mockResolvedValueOnce({
      id: PUBLISHED_POST.id,
      publishedAt: PUBLISHED_POST.publishedAt,
      status: 'ERROR',
    } as TogglePostPublishedState)
    const toastErrorSpy = vi.spyOn(toast, 'error').mockReturnValue('toast-id')
    renderWithProviders(<TogglePostPublishedForm post={PUBLISHED_POST} />)
    fireEvent.click(screen.getByRole('button', { name: /Unpublish/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(toastErrorSpy).toHaveBeenCalledWith('Post could not be unpublished')
  })

  it('should toast an error message when publishing fails', async () => {
    vi.spyOn(postActions, 'togglePostPublished').mockResolvedValueOnce({
      id: UNPUBLISHED_POST.id,
      publishedAt: UNPUBLISHED_POST.publishedAt,
      status: 'ERROR',
    } as TogglePostPublishedState)
    const toastErrorSpy = vi.spyOn(toast, 'error').mockReturnValue('toast-id')
    renderWithProviders(<TogglePostPublishedForm post={UNPUBLISHED_POST} />)
    fireEvent.click(screen.getByRole('button', { name: /Publish/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(toastErrorSpy).toHaveBeenCalledWith('Post could not be published')
  })
})
