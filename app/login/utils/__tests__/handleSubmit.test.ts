import { SubmitEvent } from 'react'
import { signIn } from 'next-auth/react'

import { logger } from '@/lib/logger'

import { handleSubmit } from '../handleSubmit'

const PARAMS: FirstParameterOf<typeof handleSubmit> = {
  errorCallback: vi.fn(),
  responseErrorCallback: vi.fn(),
  successCallback: vi.fn(),
}

const form = document.createElement('form')

const emailInput = document.createElement('input')
emailInput.name = 'email'
emailInput.value = 'email@no-nothing.com'
const passwordInput = document.createElement('input')
passwordInput.name = 'password'
passwordInput.value = 'email@no-nothing.com'
form.append(emailInput, passwordInput)

const EVENT = {
  currentTarget: form,
  preventDefault: vi.fn(),
} as unknown as SubmitEvent<HTMLFormElement>

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('handleSubmit', () => {
  it('should call event.preventDefault', async () => {
    await handleSubmit(PARAMS)(EVENT)
    expect(EVENT.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('should call signIn with', async () => {
    await handleSubmit(PARAMS)(EVENT)
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: emailInput.value,
      password: passwordInput.value,
      redirect: false,
    })
  })

  describe('catch block', () => {
    it('should call error callback', async () => {
      const error = { message: 'error' }
      vi.mocked(signIn).mockRejectedValue(error)
      await handleSubmit(PARAMS)(EVENT)
      expect(PARAMS.errorCallback).toHaveBeenCalledTimes(1)
    })

    it('should not call success callback', async () => {
      const error = { message: 'error' }
      vi.mocked(signIn).mockRejectedValue(error)
      await handleSubmit(PARAMS)(EVENT)
      expect(PARAMS.successCallback).not.toHaveBeenCalled()
    })

    it('should log the error', async () => {
      const error = { message: 'error' }
      vi.mocked(signIn).mockRejectedValue(error)
      await handleSubmit(PARAMS)(EVENT)
      expect(logger.error).toHaveBeenCalledWith({ error }, 'LOGIN_ERROR')
    })
  })

  describe('response error', () => {
    it('should call response error callback when the response is blank', async () => {
      // @ts-expect-error: we need to test this behavior
      vi.mocked(signIn).mockReturnValue(undefined)
      await handleSubmit(PARAMS)(EVENT)
      expect(PARAMS.responseErrorCallback).toHaveBeenCalledWith(
        'Something went wrong',
      )
      expect(logger.error).toHaveBeenCalledWith(
        { response: undefined },
        'MISSING_LOGIN_RESPONSE',
      )
    })

    it('should call response error callback when an error is present', async () => {
      const response = { error: 'error' }
      // @ts-expect-error: we're testing the behavior that came with the template
      vi.mocked(signIn).mockReturnValue(response)
      await handleSubmit(PARAMS)(EVENT)
      expect(PARAMS.responseErrorCallback).toHaveBeenCalledWith('error')
      expect(logger.error).toHaveBeenCalledWith(
        { response },
        'LOGIN_RESPONSE_ERROR',
      )
    })

    it('should not call the success callback', async () => {
      // @ts-expect-error: we're testing the behavior that came with the template
      vi.mocked(signIn).mockReturnValue({ error: 'error' })
      await handleSubmit(PARAMS)(EVENT)
      expect(PARAMS.successCallback).not.toHaveBeenCalled()
    })
  })

  describe('success', () => {
    it('should call the success callback', async () => {
      // @ts-expect-error: object properties not important for this test
      vi.mocked(signIn).mockReturnValue({})
      await handleSubmit(PARAMS)(EVENT)
      expect(PARAMS.successCallback).toHaveBeenCalledTimes(1)
    })
  })
})
