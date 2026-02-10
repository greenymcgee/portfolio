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
  it('should render a login form', async () => {
    // @ts-expect-error: object properties not important for this test
    vi.mocked(signIn).mockReturnValue({})
    render(<LoginPage />)
    await submitLoginRequest()
    expect(mockRouter.pathname).toBe('/')
  })

  it('should handle unknown login errors', async () => {
    const response = { message: 'error' }
    vi.mocked(signIn).mockRejectedValue(response)
    render(<LoginPage />)
    await submitLoginRequest()
    expect(screen.getByText('Something went wrong')).toBeVisible()
  })

  it('should handle known response errors', async () => {
    const response = { error: 'error' }
    // @ts-expect-error: not important
    vi.mocked(signIn).mockReturnValue(response)
    render(<LoginPage />)
    await submitLoginRequest()
    expect(screen.getByText(response.error)).toBeVisible()
  })
})
