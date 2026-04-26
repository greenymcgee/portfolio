import { screen } from '@testing-library/react'

import { userFactory } from '@/test/factories'
import { renderWithProviders } from '@/test/helpers/utils'

import { RegisterFormBody } from '../registerFormBody'

const USER = userFactory.build({ password: 'Testpass1!' })
const PROPS: PropsOf<typeof RegisterFormBody> = {
  defaultEmail: USER.email,
  defaultFirstName: USER.firstName,
  defaultLastName: USER.lastName,
  defaultUsername: USER.username,
  errorMessage: '',
  fieldErrors: undefined,
  pending: false,
}

describe('<RegisterFormBody />', () => {
  it.each(['First name', 'Last name', 'Username', 'Email', 'Password'])(
    'should render all five labeled inputs',
    (label) => {
      renderWithProviders(<RegisterFormBody {...PROPS} />)
      expect(screen.getByLabelText(new RegExp(label))).toBeVisible()
    },
  )

  it('should render the generic error message', () => {
    renderWithProviders(<RegisterFormBody {...PROPS} errorMessage="oops" />)
    expect(screen.getByTestId('error-message')).toHaveTextContent('oops')
  })

  it('should render field-level errors', () => {
    renderWithProviders(
      <RegisterFormBody
        {...PROPS}
        fieldErrors={{ email: ['Invalid email'] }}
      />,
    )
    expect(screen.getByText('Invalid email')).toBeVisible()
  })

  it('should disable the submit button while pending', () => {
    renderWithProviders(<RegisterFormBody {...PROPS} pending />)
    expect(screen.getByTestId('submit-register-button')).toBeDisabled()
  })

  it('should restore default values', () => {
    const email = 'a@b.com'
    renderWithProviders(<RegisterFormBody {...PROPS} defaultEmail={email} />)
    expect(screen.getByLabelText(/Email address/)).toHaveValue(email)
  })
})
