import { act, screen } from '@testing-library/react'

import { mockCookieHeader, renderWithProviders } from '@/test/helpers/utils'
import { mockRootLayoutAuthSession, rootLayoutServer } from '@/test/servers'

import { AdminMenu } from '..'

beforeAll(() => rootLayoutServer.listen())
afterEach(() => rootLayoutServer.resetHandlers())
afterAll(() => rootLayoutServer.close())

describe('<AdminMenu />', () => {
  it('should not render anything when AdminMenuContext.content is blank', async () => {
    const { container } = renderWithProviders(<AdminMenu />)
    await act(() => expect(container).toBeEmptyDOMElement())
  })

  it('should render when content and a user are present', async () => {
    await mockCookieHeader()
    mockRootLayoutAuthSession({ role: 'ADMIN' })
    renderWithProviders(<AdminMenu />, {
      initialAdminMenuContent: <div>hello</div>,
    })
    expect(await screen.findByTestId('admin-menu-toggle')).toBeVisible()
  })
})
