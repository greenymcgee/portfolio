import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { errAsync, okAsync } from 'neverthrow'
import mockRouter from 'next-router-mock'
import { flattenError } from 'zod'

import { REGISTRATION_FAILED_MESSAGE } from '@/features/users/constants'
import { createUserSchema } from '@/features/users/schemas'
import { UserService } from '@/features/users/user.service'
import {
  CREATED,
  INTERNAL_SERVER_ERROR,
  ROUTES,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { userFactory } from '@/test/factories'
import { renderWithProviders } from '@/test/helpers/utils'

import { RegisterForm } from '..'

type CreateUserReturn = Awaited<ReturnType<typeof UserService.create>>

let createSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  mockRouter.push(ROUTES.register)
  createSpy = vi.spyOn(UserService, 'create')
})

afterEach(() => {
  vi.restoreAllMocks()
})

function buildZodErrorWithEmailAndPassword() {
  const result = createUserSchema.safeParse({
    email: 'bad',
    firstName: 'A',
    lastName: 'B',
    password: 'short',
    username: 'u',
  })
  expect(result.success).toBe(false)
  return (result as Extract<typeof result, { success: false }>).error
}

async function fillValidRegistrationForm() {
  const user = userFactory.build({ password: 'Testpass1!' })
  await userEvent.type(screen.getByLabelText(/First name/), user.firstName)
  await userEvent.type(screen.getByLabelText(/Last name/), user.lastName)
  await userEvent.type(screen.getByLabelText(/Username/), user.username)
  await userEvent.type(screen.getByLabelText(/Email address/), user.email)
  await userEvent.type(screen.getByLabelText(/Password/), user.password)
}

describe('<RegisterForm />', () => {
  it('should render Zod field errors when validation fails', async () => {
    const zodError = buildZodErrorWithEmailAndPassword()
    createSpy.mockResolvedValueOnce(
      errAsync({
        details: zodError,
        status: UNPROCESSABLE_CONTENT,
        type: 'dto',
      } as const) as unknown as CreateUserReturn,
    )
    renderWithProviders(<RegisterForm />)
    await fillValidRegistrationForm()
    const submitButton = screen.getByTestId('submit-register-button')
    fireEvent.click(submitButton)
    await waitForElementToBeRemoved(screen.getByRole('status'))
    const flattened = flattenError(zodError)
    const emailMessage = flattened.fieldErrors.email?.[0] as string
    const passwordMessage = flattened.fieldErrors.password?.[0] as string
    await waitFor(() => {
      expect(screen.getByText(emailMessage)).toBeVisible()
      expect(screen.getByText(passwordMessage)).toBeVisible()
    })
  })

  it('should render the generic error message when persistence fails', async () => {
    createSpy.mockResolvedValueOnce(
      errAsync({
        details: new PrismaError(new Error('duplicate')),
        status: INTERNAL_SERVER_ERROR,
        type: 'entity',
      } as const) as unknown as CreateUserReturn,
    )
    renderWithProviders(<RegisterForm />)
    await fillValidRegistrationForm()
    const submitButton = screen.getByTestId('submit-register-button')
    fireEvent.click(submitButton)
    await waitForElementToBeRemoved(screen.getByRole('status'))
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        REGISTRATION_FAILED_MESSAGE,
      )
    })
  })

  it('should redirect to login upon success', async () => {
    const persisted = userFactory.build({ password: 'hashed' })
    const { password: _p, ...publicUser } = persisted
    void _p
    createSpy.mockResolvedValueOnce(
      okAsync({
        status: CREATED,
        user: publicUser,
      } as const) as unknown as CreateUserReturn,
    )
    renderWithProviders(<RegisterForm />)
    await fillValidRegistrationForm()
    const submitButton = screen.getByTestId('submit-register-button')
    fireEvent.click(submitButton)
    await waitForElementToBeRemoved(screen.getByRole('status'))
    await waitFor(() => expect(mockRouter.pathname).toBe(ROUTES.login))
  })
})
