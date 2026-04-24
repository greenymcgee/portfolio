import { screen } from '@testing-library/react'

import { PostRepository } from '@/features/posts/post.repository'
import { NotFoundError } from '@/lib/errors'
import { AUTHORED_POST } from '@/test/fixtures'
import { AdminMenuContextWrapper } from '@/test/helpers/components'
import { renderWithProviders } from '@/test/helpers/utils'

import { PostPageContent } from '..'

const PROPS: PropsOf<typeof PostPageContent> = {
  params: Promise.resolve({ id: AUTHORED_POST.id }),
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('<PostPageContent />', () => {
  it('should render an h1 inside a main when the request fails', async () => {
    vi.spyOn(PostRepository, 'findOne').mockResolvedValueOnce(
      new NotFoundError(AUTHORED_POST.id, 'Post'),
    )
    const jsx = await PostPageContent(PROPS)
    renderWithProviders(jsx)
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Something went wrong',
    })
    expect(screen.getByRole('main')).toContainElement(heading)
  })

  it('should render an h1 inside a main when the request succeeds', async () => {
    vi.spyOn(PostRepository, 'findOne').mockResolvedValueOnce(AUTHORED_POST)
    const jsx = await PostPageContent(PROPS)
    renderWithProviders(jsx)
    const heading = screen.getByRole('heading', {
      level: 1,
      name: AUTHORED_POST.title,
    })
    expect(screen.getByRole('main')).toContainElement(heading)
  })

  it('should set the admin menu content when the request succeeds', async () => {
    vi.spyOn(PostRepository, 'findOne').mockResolvedValueOnce(AUTHORED_POST)
    const jsx = await PostPageContent(PROPS)
    renderWithProviders(jsx, { wrapper: AdminMenuContextWrapper })
    expect(screen.getByTestId('post-page-admin-menu-content')).toBeVisible()
  })

  it('should gracefully handle missing post content', async () => {
    vi.spyOn(PostRepository, 'findOne').mockResolvedValueOnce({
      ...AUTHORED_POST,
      content: null,
    })
    const jsx = await PostPageContent(PROPS)
    renderWithProviders(jsx)
    expect(screen.getByRole('article')).toBeVisible()
  })
})
