'use client'

import { useActionState, useState } from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import Form from 'next/form'

import { createUser } from '@/features/users/actions'
import { REGISTRATION_FAILED_MESSAGE } from '@/features/users/constants'

import { RegisterFormBody } from '../registerFormBody'

export function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState('')
  const [state, action, pending] = useActionState(
    withCallbacks(createUser, {
      onError: (actionState) => {
        if (actionState.error) {
          setErrorMessage('')
          return
        }

        setErrorMessage(REGISTRATION_FAILED_MESSAGE)
      },
    }),
    { status: 'IDLE' },
  )

  return (
    <Form action={action} className="space-y-6" data-testid="register-form">
      <RegisterFormBody
        defaultEmail={state.email}
        defaultFirstName={state.firstName}
        defaultLastName={state.lastName}
        defaultUsername={state.username}
        errorMessage={errorMessage}
        fieldErrors={state.error?.fieldErrors}
        pending={pending}
      />
    </Form>
  )
}
