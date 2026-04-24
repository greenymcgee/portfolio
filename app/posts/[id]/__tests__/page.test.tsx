import { render, screen } from '@testing-library/react'

import { PostRepository } from '@/features/posts/post.repository'
import { AUTHORED_POST } from '@/test/fixtures'

import PostPage from '../page'

const PROPS: PropsOf<typeof PostPage> = {
  params: Promise.resolve({ id: AUTHORED_POST.id }),
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('<PostPage />', () => {
  it('should render post loader', () => {
    vi.spyOn(PostRepository, 'findOne').mockResolvedValueOnce(AUTHORED_POST)
    render(<PostPage {...PROPS} />)
    expect(screen.getByTestId('post-loader')).toBeVisible()
  })
})
