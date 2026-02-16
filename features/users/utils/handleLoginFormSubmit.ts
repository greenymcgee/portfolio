import { SubmitEvent } from 'react'
import { tryCatch } from '@greenymcgee/typescript-utils'
import { signIn } from 'next-auth/react'

import { signInSchema } from '@/features/users/schemas'

interface Params {
  /**
   * Fires if an error occurs.
   */
  errorCallback: (message: string) => void
  /**
   * Fires when the login request succeeds.
   */
  successCallback: VoidFunction
}

function validateFormData(event: SubmitEvent<HTMLFormElement>) {
  const formData = new FormData(event.currentTarget)
  return signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
}

export function handleLoginFormSubmit(params: Params) {
  return async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validation = validateFormData(event)

    if (validation.error)
      return params.errorCallback('Invalid email or password')

    const { email, password } = validation.data
    const { error, response } = await tryCatch(
      signIn('credentials', { email, password, redirect: false }),
    )

    if (error) return params.errorCallback('Something went wrong')

    if (!response || response.error)
      return params.errorCallback('Invalid email or password')

    params.successCallback()
  }
}
