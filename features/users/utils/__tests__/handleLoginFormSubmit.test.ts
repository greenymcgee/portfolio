import { SubmitEvent } from 'react'
import { signIn } from 'next-auth/react'

import { handleLoginFormSubmit } from '..'

const PARAMS: FirstParameterOf<typeof handleLoginFormSubmit> = {
  errorCallback: vi.fn(),
  successCallback: vi.fn(),
}

function createFormAndFields(valid: boolean) {
  const form = document.createElement('form')
  const emailInput = document.createElement('input')
  emailInput.name = 'email'
  emailInput.value = valid ? 'email@no-nothing.com' : 'not-email'
  const passwordInput = document.createElement('input')
  passwordInput.name = 'password'
  passwordInput.value = 'email@no-nothing.com'
  form.append(emailInput, passwordInput)
  return { emailInput, form, passwordInput }
}

const DEFAULT_FORM_AND_FIELDS = createFormAndFields(true)

const EVENT = {
  currentTarget: DEFAULT_FORM_AND_FIELDS.form,
  preventDefault: vi.fn(),
} as unknown as SubmitEvent<HTMLFormElement>

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('handleLoginFormSubmit', () => {
  it('should call event.preventDefault', async () => {
    await handleLoginFormSubmit(PARAMS)(EVENT)
    expect(EVENT.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('should call signIn with', async () => {
    await handleLoginFormSubmit(PARAMS)(EVENT)
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: DEFAULT_FORM_AND_FIELDS.emailInput.value,
      password: DEFAULT_FORM_AND_FIELDS.passwordInput.value,
      redirect: false,
    })
  })

  describe('validation error', () => {
    const event: typeof EVENT = {
      ...EVENT,
      currentTarget: createFormAndFields(false).form,
    }

    it('should call the error callback', async () => {
      await handleLoginFormSubmit(PARAMS)(event)
      expect(PARAMS.errorCallback).toHaveBeenCalledWith(
        'Invalid email or password',
      )
    })

    it('should not call the success callback', async () => {
      await handleLoginFormSubmit(PARAMS)(event)
      expect(PARAMS.successCallback).not.toHaveBeenCalled()
    })
  })

  describe('catch block', () => {
    const error = { message: 'error' }
    beforeEach(() => {
      vi.mocked(signIn).mockRejectedValue(error)
    })

    it('should call the error callback', async () => {
      await handleLoginFormSubmit(PARAMS)(EVENT)
      expect(PARAMS.errorCallback).toHaveBeenCalledWith('Something went wrong')
    })

    it('should not call the success callback', async () => {
      await handleLoginFormSubmit(PARAMS)(EVENT)
      expect(PARAMS.successCallback).not.toHaveBeenCalled()
    })
  })

  describe('missing response', () => {
    beforeEach(() => {
      // @ts-expect-error: we need to test this behavior
      vi.mocked(signIn).mockReturnValue(undefined)
    })

    it('should call the response error callback', async () => {
      await handleLoginFormSubmit(PARAMS)(EVENT)
      expect(PARAMS.errorCallback).toHaveBeenCalledWith(
        'Invalid email or password',
      )
    })

    it('should not call the success callback', async () => {
      await handleLoginFormSubmit(PARAMS)(EVENT)
      expect(PARAMS.successCallback).not.toHaveBeenCalled()
    })
  })

  describe('response error', () => {
    const response = { error: 'error' }
    beforeEach(() => {
      // @ts-expect-error: we're testing the behavior that came with the template
      vi.mocked(signIn).mockReturnValue(response)
    })

    it('should call the response error callback', async () => {
      await handleLoginFormSubmit(PARAMS)(EVENT)
      expect(PARAMS.errorCallback).toHaveBeenCalledWith(
        'Invalid email or password',
      )
    })

    it('should not call the success callback', async () => {
      await handleLoginFormSubmit(PARAMS)(EVENT)
      expect(PARAMS.successCallback).not.toHaveBeenCalled()
    })
  })

  describe('success', () => {
    it('should call the success callback', async () => {
      // @ts-expect-error: object properties not important for this test
      vi.mocked(signIn).mockReturnValue({})
      await handleLoginFormSubmit(PARAMS)(EVENT)
      expect(PARAMS.successCallback).toHaveBeenCalledTimes(1)
    })
  })
})
