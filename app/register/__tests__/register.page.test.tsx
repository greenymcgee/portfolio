import { screen } from '@testing-library/react'

import { ROUTES } from '@/globals/constants'
import { renderWithProviders } from '@/test/helpers/utils'

import RegisterPage from '../page'

describe('<RegisterPage />', () => {
  it('should render the heading', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByTestId('register-page-heading').tagName).toBe('H1')
  })

  it('should render the RegisterForm', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByTestId('register-form')).toBeVisible()
  })

  it('should render the sign-in link', () => {
    renderWithProviders(<RegisterPage />)
    const signIn = screen.getByRole('link', { name: /Sign in/i })
    expect(signIn).toHaveAttribute('href', ROUTES.login)
  })
})
