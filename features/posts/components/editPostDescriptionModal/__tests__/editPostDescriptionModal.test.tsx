import { faker } from '@faker-js/faker'
import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { toast } from 'sonner'

import { PostRepository } from '@/features/posts/post.repository'
import { NotFoundError, PrismaError } from '@/lib/errors'
import { AUTHORED_POST, UNPUBLISHED_POST } from '@/test/fixtures'
import { mockServerSession, renderWithProviders } from '@/test/helpers/utils'

import { EditPostDescriptionModal } from '..'

const PROPS: PropsOf<typeof EditPostDescriptionModal> = {
  defaultDescription: AUTHORED_POST.description,
  postId: AUTHORED_POST.id,
  title: AUTHORED_POST.title,
}

afterEach(() => vi.restoreAllMocks())

describe('<EditPostDescriptionModal />', () => {
  it('should open the dialog with the current description when the trigger is clicked', () => {
    renderWithProviders(<EditPostDescriptionModal {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    expect(screen.getByRole('heading', { name: PROPS.title })).toBeVisible()
    expect(screen.getByLabelText('Description')).toHaveValue(
      PROPS.defaultDescription,
    )
  })

  it('should disable the save button when there is no description', () => {
    renderWithProviders(
      <EditPostDescriptionModal {...PROPS} defaultDescription={undefined} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    expect(screen.getByRole('button', { name: /Save changes/ })).toBeDisabled()
  })

  it('should close the dialog and toast a success message when the update succeeds', async () => {
    vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(UNPUBLISHED_POST)
    const toastSuccessSpy = vi
      .spyOn(toast, 'success')
      .mockReturnValue('toast-id')
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostDescriptionModal {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    fireEvent.click(screen.getByRole('button', { name: /Save changes/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(toastSuccessSpy).toHaveBeenCalledWith(
      'The description has been saved',
      { closeButton: true },
    )
    await waitFor(() =>
      expect(screen.queryByText(PROPS.title)).not.toBeInTheDocument(),
    )
  })

  it('should show an error when the post cannot be found', async () => {
    vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(
      new NotFoundError(PROPS.postId, 'Post'),
    )
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostDescriptionModal {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    fireEvent.click(screen.getByRole('button', { name: /Save changes/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(screen.getByText('The post could not be found')).toBeVisible()
  })

  it('should show a generic error when the update fails unexpectedly', async () => {
    vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(
      new PrismaError(new Error('Internal Server Error')),
    )
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostDescriptionModal {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    fireEvent.click(screen.getByRole('button', { name: /Save changes/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(screen.getByText('Something went wrong')).toBeVisible()
  })

  it('should close the dialog when cancel is clicked', () => {
    renderWithProviders(<EditPostDescriptionModal {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText(PROPS.title)).not.toBeInTheDocument()
  })

  it('should show only the field error when the description fails validation', async () => {
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostDescriptionModal {...PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: faker.string.alpha({ length: 101 }) },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save changes/ }))
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(screen.getByRole('alert')).toBeVisible()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    expect(
      screen.queryByText('The post could not be found'),
    ).not.toBeInTheDocument()
  })

  it('should enable the save button once a description is entered', () => {
    renderWithProviders(
      <EditPostDescriptionModal {...PROPS} defaultDescription={undefined} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Description' }))
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: faker.lorem.sentence() },
    })
    expect(
      screen.getByRole('button', { name: /Save changes/ }),
    ).not.toBeDisabled()
  })
})
