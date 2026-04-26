# Frontend State Management — fix-register-page

> Part of [fix-register-page architecture](../README.md). Narrative
> companion to [`./components.md`](./components.md) and
> [`../backend/action-state.md`](../backend/action-state.md). This
> wiring story is the single most copy-pasted-incorrectly thing in the
> codebase, so it gets its own file.

## What lives where

| State | Owner | Type | Why it lives there |
| --- | --- | --- | --- |
| Form-value preservation (`firstName`, `lastName`, `username`, `email`) | Action state via `useActionState` | `CreateUserState` | Re-populated after a server-action round trip. Must come from the action because the action is the only thing that survives a submission. |
| Per-field Zod errors | Action state via `useActionState` | `state.error?.formErrors.fieldErrors` | Same reasoning — server-validated, so the source of truth is the action's return. |
| Generic top-of-form error message | Client `useState` in `RegisterForm` | `string` (empty when none) | Set by `withCallbacks(onError)` callback, not by the action's return value. See "Why not action state?" below. |
| `pending` (submit button disabled state) | `useActionState`'s third tuple slot | `boolean` | Standard React form-action plumbing. |
| Password value across submits | **Nowhere** | — | Deliberately not preserved. See [`../security-considerations.md`](../security-considerations.md). |

## The `withCallbacks` wiring

`withCallbacks` is from `@greenymcgee/typescript-utils`. It wraps an
action and fires `onError` whenever the wrapped action returns
`state.status === 'ERROR'` (the `ActionState` interface from the same
package, which `CreateUserState` extends — see
[`../backend/action-state.md`](../backend/action-state.md)).

Pattern in `RegisterForm`:

```tsx
const [errorMessage, setErrorMessage] = useState('')
const [state, action, pending] = useActionState(
  withCallbacks(createUser, {
    onError: () => setErrorMessage(REGISTRATION_FAILED_MESSAGE),
  }),
  { status: 'IDLE' },
)
```

Result: any `Err` branch from `UserService.create` (entity, dto,
unhandled) eventually triggers `onError`, which sets the client error
message. The action itself never returns the message string —
[`../backend/action-state.md`](../backend/action-state.md) deliberately
omits a `errorMessage` field.

## Why not action state?

Putting the generic error string into `CreateUserState` was the
initial design. Rejected because:

1. **Drift from precedent.** `CreatePostForm` already uses
   `withCallbacks` for the same role; mirroring that keeps
   `CreateUserState` a near-clone of `PostCreateState` and avoids
   inventing a parallel error-surfacing shape.
2. **Conflation risk.** A `error?: ZodError | string` union on
   `CreateUserState` would mix field-level and form-level rendering
   paths, making the presenter harder to type and easier to misuse.

Full rationale in [`../../decisions.md`](../../decisions.md) → "Generic
error string via `withCallbacks`".

## Wiring contract — must hold

The `RegisterForm` orchestrator and the `createUser` action are
contractually bound on these points. If any reviewer touches one, they
must check the other:

| Contract | Action side | Form side |
| --- | --- | --- |
| Generic error → `onError` fires | Returns `{ status: 'ERROR' }` (no `error` field) on entity / unhandled branches. | `withCallbacks(onError)` sets `errorMessage`. |
| Field errors → field-level rendering | Returns `{ status: 'ERROR', error: ZodError }` on dto branch. | `state.error?.formErrors.fieldErrors` passed to body. |
| Form values restored except password | Returns `...formValues` (rest-stripped of `password`) on every error branch. | `defaultEmail` / `defaultFirstName` / etc. wired to `state.*` (no `defaultPassword`). |
| Success → server-side redirect | Calls `redirect(ROUTES.login)` (throws; never returns). | No client-side navigation logic needed. |

Breakage of any row above is what the `registerForm.test.tsx` branch
table in [`../testing-strategy.md`](../testing-strategy.md) is designed
to catch.
