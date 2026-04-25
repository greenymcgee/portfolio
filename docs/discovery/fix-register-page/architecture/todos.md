# Todos — fix-register-page

> Items added by the skill are marked `[skill]`; engineer-added items are
> marked `[engineer]`. Resolved items move to `decisions.md` with rationale.

## Open

- [ ] **UX follow-up: post-registration `/login` notice.** [skill] Optional —
  `redirect(`${ROUTES.login}?registered=true`)` so the login page can render
  an "Account created — please sign in" notice. Out of scope for the
  initial-plan-only agent; pick up in Step 2 architecture or as a follow-up
  ticket. Tracked alongside R3 in `initial_plan.md`.

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
