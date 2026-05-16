import { act, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { ROUTES } from '@/globals/constants'
import { AUTHORED_POST } from '@/test/fixtures'
import {
  mockAuthSessionResponse,
  renderWithProviders,
} from '@/test/helpers/utils'
import { rootLayoutServer } from '@/test/servers'

import { EditPostPolicyEnforcer } from '..'

beforeEach(() => {
  mockRouter.push(ROUTES.editPost(AUTHORED_POST.id))
})
beforeAll(() => rootLayoutServer.listen())
afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
  rootLayoutServer.resetHandlers()
  act(() => {
    mockRouter.push(ROUTES.editPost(AUTHORED_POST.id))
  })
})
afterAll(() => rootLayoutServer.close())

describe('<EditPostPolicyEnforcer />', () => {
  it('should redirect an unauthorized user to home', async () => {
    mockAuthSessionResponse(rootLayoutServer, { role: 'USER' })
    renderWithProviders(<EditPostPolicyEnforcer />, { includesSession: true })
    await waitFor(() => expect(mockRouter.pathname).toBe(ROUTES.home))
  })

  it('should not redirect for an admin user', () => {
    renderWithProviders(<EditPostPolicyEnforcer />, { includesSession: true })
    expect(mockRouter.pathname).toBe(ROUTES.editPost(AUTHORED_POST.id))
  })
})
