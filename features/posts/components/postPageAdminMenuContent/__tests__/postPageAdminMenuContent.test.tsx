import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import mockRouter from 'next-router-mock'
import { toast } from 'sonner'

import { PostRepository } from '@/features/posts/post.repository'
import { ROUTES } from '@/globals/constants'
import { NotFoundError } from '@/lib/errors'
import { AUTHORED_POST } from '@/test/fixtures'
import { mockServerSession, renderWithProviders } from '@/test/helpers/utils'

import { PostPageAdminMenuContent } from '..'

const PROPS: PropsOf<typeof PostPageAdminMenuContent> = { post: AUTHORED_POST }

beforeEach(() => mockRouter.push(ROUTES.post(PROPS.post.id)))
afterEach(() => vi.restoreAllMocks())

describe('<PostPageAdminMenuContent />', () => {
  it('should render a link to the new post page', () => {
    renderWithProviders(<PostPageAdminMenuContent {...PROPS} />)
    expect(screen.getByRole('link', { name: /New Post/ })).toHaveAttribute(
      'href',
      ROUTES.newPost,
    )
  })

  it('should toast an error message when the delete request fails', async () => {
    mockServerSession('ADMIN')
    vi.spyOn(PostRepository, 'delete').mockResolvedValueOnce(
      new NotFoundError(AUTHORED_POST.id, 'Post'),
    )
    const toastErrorSpy = vi.spyOn(toast, 'error').mockReturnValue('toast-id')
    renderWithProviders(<PostPageAdminMenuContent {...PROPS} />)
    fireEvent.click(
      screen.getByRole('button', { name: `Delete ${AUTHORED_POST.title}` }),
    )
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(toastErrorSpy).toHaveBeenCalledWith('Post could not be deleted')
    expect(mockRouter.pathname).toBe(ROUTES.post(AUTHORED_POST.id))
  })
})
