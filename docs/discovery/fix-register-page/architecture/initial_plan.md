# Initial Plan — fix-register-page

> Step 1 output. Analysis only — no code. See `inputs/requirements.md` and
> `inputs/constraints.md` for source-of-truth. Decisions log: `decisions.md`.
> Open architecture questions: `todos.md`.

## Goal

The `/register` page is broken: it calls `signIn('credentials', …)` directly
without ever creating the user record. Wire it up to a real "create user" path
that follows the existing backend conventions (Dto → Repository → Service),
delete the duplicate `/users/new` page, and add test coverage.

## Technical Feasibility

Feasible as a code-only change. The `User` model already carries every field
the register form collects (`firstName`, `lastName`, `username`, `email`,
`password`) plus `roles` (defaults to `[USER]`), `id`, `createdAt`,
`updatedAt`. No schema changes required — satisfies constraint #1 (no
migrations).

The only missing pieces are:

- A `createUserSchema` (Zod) enforcing `firstName`/`lastName`/`username`
  (non-empty), `email` (valid email), and `password` (min 8 chars **and** at
  least one non-alphanumeric character — two distinct issues so the form can
  surface them independently).
- A `CreateUserDto` that takes `FormData` (no `Request` involved — server
  action only) and validates via `createUserSchema.safeParse`.
- A `UserRepository.create` that calls `bcrypt.hash(password, …)`
  (`bcryptjs` already a dep, used by `verifyLoginRequest`) and writes the
  row. Hashing lives only in this layer.
- A `UserService.create` that orchestrates DTO validation, repository call,
  and error normalization. **No** `authenticateAPISession` or
  `hasPermission` check — self-registration is anonymous.
- A `createUser` server action invoked via `useActionState` from the
  register page. Calls `UserService.create` directly (no `fetch`, no
  `/api/users` route, no `tryPostNewUser` helper, no `usersServer` msw
  setup). On success, calls Next's `redirect('/login')`. On error, returns
  a generic `"Registration failed. Please try again."` state — the
  underlying `PrismaError` is logged by the repository / service layer for
  engineer visibility.
- A rewrite of `app/register/page.tsx` to use `useActionState(createUser,
  …)`, drop the `signIn` call entirely, and surface field-level Zod errors
  plus the generic action error.
- Deletion of `app/users/new/page.tsx` (broken anyway: saves
  `password: ''`) **and** removal of `/users/new` from the `matcher` in
  `proxy.ts` (currently `['/posts/new', '/users/new']`).
- `ROUTES.newUser` removal from `globals/constants/routes.ts` (only
  runtime caller is `proxy.ts`, addressed above).

`userFactory` (`test/factories/user.ts`) and user fixtures (`ADMIN_USER`,
`BASIC_USER`) already exist — no factory or fixture work needed.

## Existing Patterns Reused

| Concern | Reference | Notes |
| --- | --- | --- |
| DTO shape (`Request` → Zod params) | `features/posts/dto/create-post.dto.ts` | Mirror for `CreateUserDto` if HTTP route is used |
| Repository (Prisma + `tryCatch` + error-as-value) | `features/posts/post.repository.ts` (`create` method) | Same shape, no `Session['user']` arg |
| Service (neverthrow `result.match`, error envelopes) | `features/posts/post.service.ts` | Auth/perm branch omitted — anonymous create |
| Action pattern w/ `useActionState` | `features/posts/actions/createPost.ts` | Maps formData → schema → call → redirect/state |
| Repository tests | `features/posts/__tests__/post.repository.test.ts` | Mock `prismaMock`, test each error branch |
| Service tests | `features/posts/__tests__/post.service.test.ts` | Mock repo, test each error branch |
| Action tests | `features/posts/actions/__tests__/createPost.test.ts` | Mock `UserService.create` directly — no msw needed since action calls service in-process |
| Page test | `app/posts/__tests__/posts.page.test.tsx` | For `/register` after rewrite |
| Permissions | `lib/permissions/constants.ts` (`users.create`) | Currently ADMIN-only; self-registration needs a new branch (see Q2) |
| Password hash check | `lib/auth/verifyLoginRequest.ts` (`bcrypt.compare`) | New code uses `bcrypt.hash` symmetrically |

## High-Level Approach

1. **Backend foundation** — `createUserSchema`, `CreateUserDto` (over
   `FormData`), `UserRepository.create` (with `bcrypt.hash`),
   `UserService.create` (no auth/permission branch). Tests for each,
   mirroring the post-side shape with `prismaMock` (repository) and
   `vi.mock('../user.repository')` (service).
2. **Server action** — `features/users/actions/createUser.ts` with
   signature `(state: CreateUserState, formData: FormData) =>
   Promise<CreateUserState>`. Calls `UserService.create(new
   CreateUserDto(formData))`. On `Ok` → `redirect(ROUTES.login)`. On
   `Err` → log (already done in service) + return `{ ...formValues
   (excluding password), status: 'ERROR' }` with a generic `error`
   message; on `Zod` errors specifically, return per-field issues from
   the `ZodError` for the form to render.
3. **Frontend** — rewrite `app/register/page.tsx` to
   `useActionState(createUser, { status: 'IDLE' })`. Drop the `signIn`
   import and call entirely. Surface field-level Zod issues next to
   inputs, plus the generic action error in the existing error slot.
   Form fields stay the same: `firstName`, `lastName`, `username`,
   `email`, `password`.
4. **Cleanup** — delete `app/users/new/page.tsx`; remove `/users/new`
   from `proxy.ts` `matcher` (so it becomes `['/posts/new']`); remove
   `ROUTES.newUser` from `globals/constants/routes.ts`.
5. **Test coverage** — repository
   (`features/users/__tests__/user.repository.test.ts`, `prismaMock`),
   service (`features/users/__tests__/user.service.test.ts`, mocked
   repo), action **integration** test
   (`features/users/actions/__tests__/createUser.db.test.ts` —
   `.db.test.ts` per the existing `getPost.db.test.ts` /
   `deletePost.db.test.ts` pattern: mocked-service branches for
   error/Zod/duplicate paths plus a `describe('integration', ...)`
   block using `setupTestDatabase({ mutatesData: true })` that posts
   real `FormData`, asserts a `User` row exists with the form's
   `email`/`username`, asserts `bcrypt.compare(rawPassword,
   user.password)` resolves true, and asserts the action redirected to
   `ROUTES.login`), and register page
   (`app/register/__tests__/register.page.test.tsx`). Reuse existing
   `userFactory` and user fixtures.

## Key Dependencies

- `bcryptjs` — already installed (used in `verifyLoginRequest`).
- `next-auth/react` `signIn` — already in use on register page.
- `neverthrow`, `zod`, `@greenymcgee/typescript-utils` — established stack.
- No new packages anticipated.

## Risks & Unknowns

- **R1 (low, mitigated): User-enumeration on `/register`.** A duplicate
  `email` or `username` produces the generic `"Registration failed.
  Please try again."` message — same string as any other create failure
  — so the `/register` response gives an attacker no signal about which
  (if any) field collided. Engineer-visible debugging is preserved via
  `logger.error(prismaError, …)` inside `UserRepository` /
  `UserService`.
- **R2 (medium): First "anonymous-allowed" backend path.**
  `UserService.create` is the codebase's first service method that
  intentionally skips `authenticateAPISession` + `hasPermission`. Need
  to be sure this doesn't drift into a template for skipping auth
  elsewhere — call it out explicitly in the service file via a comment
  that anchors back to this discovery doc, and keep the "anonymous"
  branch narrow (only `create`; no other `UserService` methods get the
  same treatment without their own decision).
- **R3 (low): Auto-login after registration removed (not a risk, a UX
  trade-off worth flagging).** Users must manually sign in on `/login`
  after registering. Engineer-accepted trade-off; no follow-up planned.

## Out of Scope

Explicit per `inputs/requirements.md`, `inputs/constraints.md`, and
intentional descoping below:

- Schema changes / migrations.
- Email verification flow.
- OAuth / non-credentials providers.
- Visual redesign of the register form.
- Rate-limiting / CAPTCHA on registration.
- Password reset flow.
- Admin-driven user creation UI (the deleted `/users/new` is not being
  replaced).
