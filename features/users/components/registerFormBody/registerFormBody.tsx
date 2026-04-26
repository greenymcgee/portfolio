import { Button, Spinner } from '@/globals/components/ui'

import type { CreateUserParams } from '../../schemas'
import { FieldErrorMessages } from '../fieldErrorMessages'
import { CREATE_USER_FIELDS } from './constants'

type FieldErrors = Partial<Record<keyof CreateUserParams, string[] | undefined>>

type Props = {
  defaultEmail: FormDataEntryValue | null | undefined
  defaultFirstName: FormDataEntryValue | null | undefined
  defaultLastName: FormDataEntryValue | null | undefined
  defaultUsername: FormDataEntryValue | null | undefined
  errorMessage: string
  fieldErrors: FieldErrors | undefined
  pending: boolean
}

export function RegisterFormBody({
  defaultEmail,
  defaultFirstName,
  defaultLastName,
  defaultUsername,
  errorMessage,
  fieldErrors,
  pending,
}: Props) {
  return (
    <>
      {errorMessage ? (
        <p
          className="mb-4 text-sm text-red-500"
          data-testid="error-message"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      <div>
        <label
          className="mb-2 text-lg font-medium"
          htmlFor={CREATE_USER_FIELDS.firstName}
        >
          First name <span aria-label="Required">*</span>
        </label>
        <input
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultFirstName ? String(defaultFirstName) : ''}
          id={CREATE_USER_FIELDS.firstName}
          name={CREATE_USER_FIELDS.firstName}
          required
          type="text"
        />
        <FieldErrorMessages
          id={CREATE_USER_FIELDS.firstName}
          messages={fieldErrors?.firstName}
        />
      </div>
      <div>
        <label
          className="mb-2 text-lg font-medium"
          htmlFor={CREATE_USER_FIELDS.lastName}
        >
          Last name <span aria-label="Required">*</span>
        </label>
        <input
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultLastName ? String(defaultLastName) : ''}
          id={CREATE_USER_FIELDS.lastName}
          name={CREATE_USER_FIELDS.lastName}
          required
          type="text"
        />
        <FieldErrorMessages
          id={CREATE_USER_FIELDS.lastName}
          messages={fieldErrors?.lastName}
        />
      </div>
      <div>
        <label
          className="mb-2 text-lg font-medium"
          htmlFor={CREATE_USER_FIELDS.username}
        >
          Username <span aria-label="Required">*</span>
        </label>
        <input
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultUsername ? String(defaultUsername) : ''}
          id={CREATE_USER_FIELDS.username}
          name={CREATE_USER_FIELDS.username}
          required
          type="text"
        />
        <FieldErrorMessages
          id={CREATE_USER_FIELDS.username}
          messages={fieldErrors?.username}
        />
      </div>
      <div>
        <label
          className="mb-2 text-lg font-medium"
          htmlFor={CREATE_USER_FIELDS.email}
        >
          Email address <span aria-label="Required">*</span>
        </label>
        <input
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultEmail ? String(defaultEmail) : ''}
          id={CREATE_USER_FIELDS.email}
          name={CREATE_USER_FIELDS.email}
          required
          type="email"
        />
        <FieldErrorMessages
          id={CREATE_USER_FIELDS.email}
          messages={fieldErrors?.email}
        />
      </div>
      <div>
        <label
          className="mb-2 text-lg font-medium"
          htmlFor={CREATE_USER_FIELDS.password}
        >
          Password <span aria-label="Required">*</span>
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-lg border px-4 py-2"
          id={CREATE_USER_FIELDS.password}
          name={CREATE_USER_FIELDS.password}
          required
          type="password"
        />
        <FieldErrorMessages
          id={CREATE_USER_FIELDS.password}
          messages={fieldErrors?.password}
        />
      </div>
      <Button
        className="ml-auto block"
        data-testid="submit-register-button"
        disabled={pending}
        size="lg"
        type="submit"
      >
        Register{' '}
        {pending ? <Spinner className="inline" data-icon="inline-end" /> : null}
      </Button>
    </>
  )
}
