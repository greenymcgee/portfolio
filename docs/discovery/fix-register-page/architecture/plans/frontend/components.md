# Components — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.11–§6.12.

Two new components under `features/users/components/`, mirroring
`features/posts/components/{createPostForm,createPostFormBody}/`
exactly. The page (`app/register/page.tsx`) becomes a thin entry —
see [`./README.md`](./README.md).

## RegisterForm — orchestrator

File: `features/users/components/registerForm/registerForm.tsx`.

```tsx
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
      onError: () => setErrorMessage(REGISTRATION_FAILED_MESSAGE),
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
        fieldErrors={state.error?.formErrors.fieldErrors}
        pending={pending}
      />
    </Form>
  )
}
```

Mirrors `CreatePostForm` minus the session/permission gate (anonymous
flow) and the rich-text editor.

## RegisterFormBody — presenter

File: `features/users/components/registerFormBody/registerFormBody.tsx`.

Receives:

| Prop | Type | Purpose |
| --- | --- | --- |
| `defaultEmail` / `defaultFirstName` / `defaultLastName` / `defaultUsername` | `FormDataEntryValue \| null \| undefined` | Re-populate inputs after a failed submit. |
| `errorMessage` | `string` | Generic top-of-form error (set by `withCallbacks`). Empty string when none. |
| `fieldErrors` | `Partial<Record<keyof CreateUserParams, string[]>> \| undefined` | Per-field Zod messages (`state.error?.formErrors.fieldErrors`). |
| `pending` | `boolean` | Disable submit + show spinner. |

Renders five inputs (`firstName`, `lastName`, `username`, `email`,
`password`) with associated `<label>` elements (per
`.cursor/rules/VITEST_RULES.mdc` rule 22 — labels are clickable in
tests). Each input shows its `fieldErrors` list below it via
`aria-live="polite"` text. The generic `errorMessage` block sits above
the input group with `role="alert"` and `data-testid="error-message"`
(matching `CreatePostFormBody`'s convention). Submit button has
`data-testid="submit-register-button"`.

## Why split orchestrator / presenter

`.cursor/skills/clean-authoring/SKILL.md`:

- "Thin entry points" — page files exist to wire, not to own logic.
- "Orchestration vs. presentation" — orchestrator owns state/effects,
  presenter owns output shape.

Split rationale + rejected alternatives in [`../../decisions.md`](../../decisions.md)
→ "Page split: `RegisterForm` + `RegisterFormBody`".

## Test plan

Both components have dedicated tests — see
[`../testing-strategy.md`](../testing-strategy.md):

- `registerForm.test.tsx` — drives `UserService.create` mock through
  Zod / entity / success branches.
- `registerFormBody.test.tsx` — plain presenter test (props in,
  rendered output out).
