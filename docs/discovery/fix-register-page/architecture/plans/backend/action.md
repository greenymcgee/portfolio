# Server Action — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.8.

File: `features/users/actions/createUser.ts` (new).

```typescript
'use server'

import { redirect } from 'next/navigation'
import { ZodError } from 'zod'

import { ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { CreateUserDto } from '../dto'
import { CreateUserState } from '../types'
import { UserService } from '../user.service'

type State = CreateUserState

export async function createUser(
  _: State,
  formData: FormData,
): Promise<State> {
  const { password: _password, ...formValues } = Object.fromEntries(formData)
  const result = await UserService.create(new CreateUserDto(formData))
  return result.match(
    () => redirect(ROUTES.login),
    (error) => {
      switch (error.type) {
        case 'dto': {
          const details = error.details
          return {
            ...formValues,
            error: details instanceof ZodError ? details : undefined,
            status: 'ERROR',
          } satisfies State
        }
        case 'entity': {
          return { ...formValues, status: 'ERROR' } satisfies State
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_CREATE_USER_ERROR',
          )
          return { ...formValues, status: 'ERROR' } satisfies State
        }
      }
    },
  )
}
```

## Differences from `createPost`

- Calls `UserService.create` directly; no `tryPostNewPost`, no msw
  server, no `cookie`/`session` handling.
- No `unauthorized` / `forbidden` branches (service has no auth gate —
  see [`./service.md`](./service.md)).
- Generic error message is **not** in the returned state — it's set on
  the client via `withCallbacks(onError)`. See
  [`../frontend/state-management.md`](../frontend/state-management.md).
- Form values for re-render come from inline
  `Object.fromEntries(formData)` with `password` rest-stripped — no
  separate util. The destructured `_password` is intentionally unused
  (the `_`-prefix follows the same idiom as `_: State` above and
  signals "discard"). Single caller, single concern, one line — no
  helper file is justified. See [`../../decisions.md`](../../decisions.md)
  → "Drop `getRegisterFormValues` helper, inline `Object.fromEntries`."

## Branch behavior summary

| Service result | Action returns / does | Form sees |
| --- | --- | --- |
| `Ok({ status: CREATED, user })` | `redirect(ROUTES.login)` (throws; never returns) | Browser navigates to `/login`. |
| `Err({ type: 'dto', details: ZodError, … })` | Returns `{ ...formValues, error: ZodError, status: 'ERROR' }` | Field errors render via `state.error?.formErrors.fieldErrors`. |
| `Err({ type: 'entity', … })` | Returns `{ ...formValues, status: 'ERROR' }` | `withCallbacks(onError)` fires → generic top-of-form message. |
| Unexpected `error.type` | Logs `UNHANDLED_CREATE_USER_ERROR` + returns `{ ...formValues, status: 'ERROR' }` | Same as `entity` branch. The `satisfies never` ensures TS catches new error types at compile time. |

## State type

See [`./action-state.md`](./action-state.md) for `CreateUserState`.
