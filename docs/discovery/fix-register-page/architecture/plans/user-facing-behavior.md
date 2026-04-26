# User-Facing Behavior — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §5.

## Registration flow

1. User navigates to `/register`. Page renders the form (5 fields:
   First Name, Last Name, Username, Email, Password) plus a "Sign in"
   link to `/login`.
2. User fills the form and submits.
3. **Validation** (Zod, in `createUserSchema` — see
   [`./backend/schema.md`](./backend/schema.md)):
   - All five fields required.
   - `email` must be a valid email.
   - `password` must be `min(8)` AND match `/[^A-Za-z0-9]/` (one
     non-alphanumeric character). These are two distinct Zod issues so
     each can be surfaced individually next to the password field.
4. **Validation failure** → action returns `{ ...formValues (excluding
   password), error: ZodError, status: 'ERROR' }`. Form re-renders with:
   - Per-field error text from `state.error.formErrors.fieldErrors`.
   - All previously-typed values restored except `password` (security —
     never echo the password back).
5. **Persistence failure** (e.g. duplicate `email` or `username` →
   `P2002`, or any other Prisma error) → action returns `{ ...formValues
   (excluding password), status: 'ERROR' }` (no `error` field).
   `withCallbacks(createUser, { onError })` fires and the form sets
   client state `errorMessage = 'Registration failed. Please try again.'`.
   The full `PrismaError` (with `code`, `target`, `meta`) is logged
   server-side via `logger.error` for engineer debugging. See
   [`./security-considerations.md`](./security-considerations.md) for the
   user-enumeration rationale and
   [`./frontend/state-management.md`](./frontend/state-management.md) for
   the `withCallbacks` wiring.
6. **Success** → action calls `redirect(ROUTES.login)`. User lands on
   `/login` with no auto-fill; they sign in manually with the email +
   password they just typed. (No `?registered=true` notice; see
   [`../decisions.md`](../decisions.md) → "Withdraw `?registered=true`
   follow-up.")

## Out of flow

- `/users/new` returns 404 after this change. There is no replacement
  admin-create-user UI in scope. See [`./cleanup.md`](./cleanup.md).
- `ADMIN`-scoped policy `users.create: true` remains in
  `lib/permissions/constants.ts` — no caller, but ready for a future
  admin tool. See [`./security-considerations.md`](./security-considerations.md).
