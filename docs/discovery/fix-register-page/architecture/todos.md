# Todos — fix-register-page

> Items added by the skill are marked `[skill]`; engineer-added items are
> marked `[engineer]`. Resolved items move to `decisions.md` with rationale.

## Open

_None._

## Closed (during Step 1)

All Q1–Q8 architecture-decision questions and all implementation-note
verifications are resolved. Each links to the canonical record.

| Item | Resolution |
| --- | --- |
| Q1 — Action-direct vs HTTP route | Server action only. See `decisions.md` → "Server action only (no HTTP route)" |
| Q2 — Authorization for self-registration | None. See `decisions.md` → "No authorization for self-registration" |
| Q3 — Password policy | `min(8)` + at least one non-alphanumeric. See `decisions.md` → "Password policy: min 8 with at least one special character" |
| Q4 — Duplicate-handling messaging | Vague to user, log full `PrismaError` server-side. See `decisions.md` → "Vague duplicate messaging, server-side logging" |
| Q5 — Auto-login after registration | Redirect to `/login`, no auto-`signIn`. See `decisions.md` → "Redirect to `/login` after successful registration" |
| Q6 — Form state pattern | `useActionState`. See `decisions.md` → "Form pattern: `useActionState`" |
| Q7 — Where password hashing lives | `UserRepository`. See `decisions.md` → "Password hashing lives in `UserRepository`" |
| Q8 — `CreateUserDto` source | `FormData` (no `Request`). Resolved by Q1; see `decisions.md` → "Server action only (no HTTP route)" |
| Implementation: verify `userFactory` exists | Confirmed at `test/factories/user.ts`; `ADMIN_USER` and `BASIC_USER` fixtures already present |
| Implementation: grep `ROUTES.newUser` callers | Only runtime caller is `proxy.ts` `matcher`; cleanup steps now in `initial_plan.md` step 4 |
| Implementation: hash via schema `transform` vs repo | Resolved by Q7 (repo). Schema/DTO never see the hashed value |
| New: action test as `.db.test.ts` integration | See `decisions.md` → "Action coverage as `.db.test.ts` integration" |

## Closed (during Step 2)

| Item | Resolution |
| --- | --- |
| Withdraw `?registered=true` follow-up | Agent speculation, never engineer-driven. See `decisions.md` → "Withdraw `?registered=true` follow-up" |
| Generic error string surfacing | Via `withCallbacks` (client `useState`), not action state. See `decisions.md` → "Generic error string via `withCallbacks`" |
| `UserService.create` Ok payload shape | Strip `password` before returning. See `decisions.md` → "Service Ok payload omits `password`" |
| Frontend componentry layout | Extract `RegisterForm` (orchestrator) + `RegisterFormBody` (presenter); page becomes thin entry. See `decisions.md` → "Page split: `RegisterForm` + `RegisterFormBody`" |

## Closed (during Step 3)

| Item | Resolution |
| --- | --- |
| Action-state type name | `CreateUserState` (verb-first), not `UserCreateState`. See `decisions.md` → "Action-state type named `CreateUserState`" |
| Form-values helper name | `getRegisterFormValues` (surface-named), not `getUserCreateFormValues`. See `decisions.md` → "Form-values helper named `getRegisterFormValues`" — superseded same day. |
| Drop the form-values helper | Inline `const { password: _password, ...formValues } = Object.fromEntries(formData)` in the action. Removes `features/users/utils/` from the plan. See `decisions.md` → "Drop `getRegisterFormValues` helper, inline `Object.fromEntries`" |
