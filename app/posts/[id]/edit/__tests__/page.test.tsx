import { render, screen } from '@testing-library/react'

import { AUTHORED_POST } from '@/test/fixtures'

import EditPostPage from '../page'

const neverResolvingPromise = vi.hoisted(() => new Promise<never>(() => {}))

vi.mock('@/features/posts/components', async () => {
  const actual = await vi.importActual('@/features/posts/components')
  return {
    ...actual,
    EditPostContent: () => {
      throw neverResolvingPromise
    },
  }
})

const PROPS: PropsOf<typeof EditPostPage> = {
  params: Promise.resolve({ id: AUTHORED_POST.id }),
}

describe('<EditPostPage />', () => {
  it('should render the edit post loader', () => {
    render(<EditPostPage {...PROPS} />)
    expect(screen.getByTestId('edit-post-loader')).toBeVisible()
  })
})
