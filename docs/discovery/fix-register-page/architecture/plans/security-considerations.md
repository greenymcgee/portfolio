# Security Considerations — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §6.2.

## Password hashing

`UserRepository.create` calls `bcrypt.hash(params.password, SALT_ROUNDS)`
with `SALT_ROUNDS = 10`, matching `test/helpers/utils/seedUsers.ts`. The
DTO and Service never see the hashed value; the Schema never sees the
password at all beyond validation. See [`../decisions.md`](../decisions.md)
→ "Password hashing lives in `UserRepository`" and
[`./backend/repository.md`](./backend/repository.md) for the call site.

## No authentication / authorization on `UserService.create`

Self-registration is anonymous; there is no session to authenticate
against. This is the codebase's first service method that intentionally
skips `authenticateAPISession` + `hasPermission`. To prevent the
pattern from drifting, `user.service.ts` opens with a comment block
referencing this discovery doc and constraining the exception to
`create`. See [`../decisions.md`](../decisions.md) → "No authorization
for self-registration" and [`./backend/service.md`](./backend/service.md)
for the comment block.

> **Reviewer rule.** Any future `UserService` method that copies the
> no-auth shape must come with its own architectural decision. Treat
> the absence of `authenticateAPISession` in a `UserService` method as
> a review-blocking signal unless explicitly justified.

## User-enumeration mitigation

`P2002` on either `email` or `username` produces the same generic
`REGISTRATION_FAILED_MESSAGE` ("Registration failed. Please try
again.") that any other persistence failure produces. The form gives
an attacker no signal about which field collided. The full
`PrismaError` (including `code`, `target`, `meta`) is logged
server-side via `logger.error` inside both `UserRepository.create` and
`UserService.respondWithPrismaError` for engineer-visible debugging.
See [`../decisions.md`](../decisions.md) → "Vague duplicate messaging,
server-side logging" and [`./user-facing-behavior.md`](./user-facing-behavior.md)
step 5 for what the user sees.

## `POLICIES.ADMIN.users.create: true` retained

The `/users/new` page is being deleted (see [`./cleanup.md`](./cleanup.md)),
leaving the policy entry without a runtime caller. Left in place — it's
policy-correct and ready for a future admin-driven user-creation
surface; removing it is ahead-of-time pruning. (Engineer-judgment call;
revisit only if it becomes misleading.)

## Password never echoed back

`CreateUserState` deliberately omits a `password` field. Form values
are restored on validation/persistence failure for `firstName`,
`lastName`, `username`, `email` only. The password field re-renders
empty. See [`./backend/action-state.md`](./backend/action-state.md) for
the type.

## Risk references

The user-enumeration mitigation and the anonymous-service exception are
both tracked as carried risks in [`./risks-open-questions.md`](./risks-open-questions.md)
(R1 and R2 respectively).
