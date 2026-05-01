import { render, screen } from '@testing-library/react'

import { AUTHORED_POST } from '@/test/fixtures'

import PostPage from '../page'

const neverResolvingPromise = vi.hoisted(() => new Promise<never>(() => {}))

vi.mock('@/features/posts/components', async () => {
  const actual = await vi.importActual('@/features/posts/components')
  return {
    ...actual,
    PostPageContent: () => {
      throw neverResolvingPromise
    },
  }
})

const PROPS: PropsOf<typeof PostPage> = {
  params: Promise.resolve({ id: AUTHORED_POST.id }),
}

describe('<PostPage />', () => {
  it('should render post loader', () => {
    render(<PostPage {...PROPS} />)
    expect(screen.getByTestId('post-loader')).toBeVisible()
  })
})
