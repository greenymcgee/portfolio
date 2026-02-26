import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import mockRouter from 'next-router-mock'

import { ADMIN_USER } from '@/test/fixtures'

import LoginPage from '../page'

beforeEach(() => {
  mockRouter.push('/login')
})

async function submitLoginRequest() {
  await userEvent.type(screen.getByLabelText('Email address'), ADMIN_USER.email)
  await userEvent.type(screen.getByLabelText('Password'), ADMIN_USER.password)
  await userEvent.click(screen.getByTestId('submit-login-button'))
}

describe('<LoginPage />', () => {
  it('should render a login form that redirects to the home page by default', async () => {
    // @ts-expect-error: object properties not important for this test
    vi.mocked(signIn).mockReturnValue({})
    render(<LoginPage />)
    await submitLoginRequest()
    expect(mockRouter.pathname).toBe('/')
  })

  it('should redirect to the redirect pathname when it is present', async () => {
    const query = { redirect: '/new-path' }
    mockRouter.query = query
    // @ts-expect-error: object properties not important for this test
    vi.mocked(signIn).mockReturnValue({})
    render(<LoginPage />)
    await submitLoginRequest()
    expect(mockRouter.pathname).toBe(query.redirect)
  })

  it('should render a message to the user for an error', async () => {
    const response = { error: 'error' }
    // @ts-expect-error: not important
    vi.mocked(signIn).mockReturnValue(response)
    render(<LoginPage />)
    await submitLoginRequest()
    expect(screen.getByText('Invalid email or password')).toBeVisible()
  })
})
