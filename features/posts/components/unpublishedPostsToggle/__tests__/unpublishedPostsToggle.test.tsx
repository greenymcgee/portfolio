import { fireEvent, screen } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { ROUTES } from '@/globals/constants'
import { renderWithProviders } from '@/test/helpers/utils'

import { UnpublishedPostsToggle } from '..'

beforeEach(() => {
  mockRouter.push(ROUTES.posts)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('<UnpublishedPostsToggle />', () => {
  it('should render the switch checked when the unpublished query is true', () => {
    mockRouter.push(ROUTES.unpublishedPosts)
    renderWithProviders(<UnpublishedPostsToggle />)
    expect(
      screen.getByRole('switch', { name: 'Toggle unpublished posts' }),
    ).toBeChecked()
  })

  it('should navigate to the unpublished posts route when toggled via the linked label', () => {
    renderWithProviders(<UnpublishedPostsToggle />)
    fireEvent.click(screen.getByText('Unpublished'))
    expect(mockRouter.pathname).toBe(ROUTES.posts)
    expect(mockRouter.query).toEqual({ unpublished: 'true' })
  })

  it('should navigate to the published posts route when toggled via the linked label', () => {
    mockRouter.push(ROUTES.unpublishedPosts)
    renderWithProviders(<UnpublishedPostsToggle />)
    fireEvent.click(screen.getByText('Unpublished'))
    expect(mockRouter.pathname).toBe(ROUTES.posts)
    expect(mockRouter.query).toEqual({})
  })
})
