# Action State — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.9.

File: `features/users/types/createUserState.ts` (new).

```typescript
import { ActionState } from '@greenymcgee/typescript-utils'
import { ZodError } from 'zod'

export interface CreateUserState extends ActionState {
  email?: FormDataEntryValue | null
  error?: ZodError
  firstName?: FormDataEntryValue | null
  lastName?: FormDataEntryValue | null
  username?: FormDataEntryValue | null
  // password deliberately omitted — never echo plaintext back to the form.
}
```

## Shape rationale

Mirrors `PostCreateState` (form-value preservation + `error?: ZodError`).
No string error field — the generic message lives in client `useState`
inside the `RegisterForm` orchestrator, set by `withCallbacks`. See
[`../../decisions.md`](../../decisions.md) → "Generic error string via
`withCallbacks`" for the alternatives considered, and
[`../frontend/state-management.md`](../frontend/state-management.md) for
the wiring on the form side.

## Naming

`CreateUserState` (verb-first), not `UserCreateState`. Aligns with the
rest of the feature's verb-first naming: `createUser` (action),
`CreateUserDto`, `createUserSchema`. The legacy `PostCreateState` name
is intentionally not mirrored — see [`../../decisions.md`](../../decisions.md)
→ "Action-state type named `CreateUserState`" for the rationale.

## Why `password` is absent

If `password` were echoed back to the form on a re-render after a
validation/persistence failure, every error path would reveal the
plaintext password to anyone with DOM access (browser dev tools, error
reports that capture form HTML, etc.). Omitting it forces the password
input to re-render empty on error, which is a small UX cost for a real
defense-in-depth gain. See [`../security-considerations.md`](../security-considerations.md)
("Password never echoed back").
