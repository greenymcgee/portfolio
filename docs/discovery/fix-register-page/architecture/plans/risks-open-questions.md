# Risks & Open Questions — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §7.

## Carried risks

| ID | Risk | Mitigation |
| --- | --- | --- |
| R1 | User-enumeration on `/register` via duplicate `email`/`username` messaging. | Generic `REGISTRATION_FAILED_MESSAGE` for all `P2002` cases; full `PrismaError` only logged server-side. See [`./security-considerations.md`](./security-considerations.md). |
| R2 | First "anonymous-allowed" backend path (`UserService.create` skips auth). Could become a template for other services skipping auth. | Service file opens with a comment block referencing this discovery doc and constraining the exception to `create`. Reviewer to flag any future `UserService` method that copies the no-auth shape. See [`./backend/service.md`](./backend/service.md) "The opening comment block is load-bearing". |
| R3 | No auto-login after registration. UX trade-off, not a defect. | Engineer-accepted. No follow-up planned (see [`../decisions.md`](../decisions.md) → "Withdraw `?registered=true` follow-up"). |

## Open questions

**None.** All Step-1 Q1–Q8 resolved (see [`../decisions.md`](../decisions.md)
entries dated 2026-04-25); the four Step-2 architectural decisions
(`?registered=true` withdrawal, `withCallbacks` for the generic error,
`password`-stripped Ok payload, `RegisterForm`/`RegisterFormBody`
split) are also resolved; the three Step-3 refinements
(`CreateUserState` rename, `getRegisterFormValues` rename, then
inlining `Object.fromEntries`) are likewise resolved.

If the engineer surfaces new questions during implementation, log
them in [`../todos.md`](../todos.md) and resolve via Step 3
refinement, then back-link the resolution to the relevant plans/ file.

## Areas the implementation should re-verify before PR

These aren't open questions — they're "trust but re-grep" items so
nothing has drifted between discovery and implementation:

| Item | Where to look | What to confirm |
| --- | --- | --- |
| `ROUTES.newUser` callers | Grep `ROUTES.newUser` repo-wide | Only `proxy.ts` uses the literal `'/users/new'` (not the constant); deleting both is safe. |
| `userFactory` shape | `test/factories/user.ts` | `userFactory.build()` still returns the columns the integration test reads (`email`, `firstName`, `lastName`, `username`, `password`). |
| `setupTestDatabase` cleans `prisma.user` | `test/helpers/utils/setupTestDatabase.ts` | `mutatesData: true` truncates `User` between tests so the duplicate-email test starts clean. |
| `bcryptjs` salt rounds | `test/helpers/utils/seedUsers.ts` | `SALT_ROUNDS = 10` is still the seed standard; `UserRepository.create` matches. |
| `withCallbacks` import path | `node_modules/@greenymcgee/typescript-utils/dist` (not `node_modules`-modifiable; just a sanity check) | Still exports `withCallbacks` and the `ActionState` interface used by `CreateUserState`. |
