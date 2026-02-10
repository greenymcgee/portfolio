import { SubmitEvent } from 'react'
import { signIn } from 'next-auth/react'

import { logger } from '@/lib/logger'

interface Params {
  /**
   * Fires in the catch.
   */
  errorCallback: VoidFunction
  /**
   * Fires in the try only when the response includes an error.
   */
  responseErrorCallback: (message: string) => void
  /**
   * Fires when the login request succeeds.
   */
  successCallback: VoidFunction
}

export function handleSubmit(params: Params) {
  return async (event: SubmitEvent<HTMLFormElement>) => {
    try {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const response = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      })

      if (!response) {
        logger.error({ response }, 'MISSING_LOGIN_RESPONSE')
        return params.responseErrorCallback('Something went wrong')
      }

      if (response.error) {
        logger.error({ response }, 'LOGIN_RESPONSE_ERROR')
        return params.responseErrorCallback(response.error)
      }

      params.successCallback()
    } catch (error) {
      logger.error({ error }, 'LOGIN_ERROR')
      params.errorCallback()
    }
  }
}
