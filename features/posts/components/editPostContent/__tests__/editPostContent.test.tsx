import { screen } from '@testing-library/react'

import { PostRepository } from '@/features/posts/post.repository'
import { NotFoundError } from '@/lib/errors'
import { AUTHORED_POST } from '@/test/fixtures'
import { renderWithProviders } from '@/test/helpers/utils'

import { EditPostContent } from '..'

const PROPS: PropsOf<typeof EditPostContent> = {
  params: Promise.resolve({ id: AUTHORED_POST.id }),
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('<EditPostContent />', () => {
  it('should render an error message when the request fails', async () => {
    vi.spyOn(PostRepository, 'findOne').mockResolvedValueOnce(
      new NotFoundError(AUTHORED_POST.id, 'Post'),
    )
    const jsx = await EditPostContent(PROPS)
    renderWithProviders(jsx)
    expect(screen.getByTestId('edit-post-content-error')).toBeVisible()
  })

  it('should render the form when the request succeeds', async () => {
    vi.spyOn(PostRepository, 'findOne').mockResolvedValueOnce(AUTHORED_POST)
    const jsx = await EditPostContent(PROPS)
    renderWithProviders(jsx)
    expect(screen.getByTestId('edit-post-form')).toBeVisible()
  })
})
