# Architecture — fix-register-page

> Step 2 output. Cross-references: `inputs/requirements.md`,
> `inputs/constraints.md`, `initial_plan.md` (Step 1 analysis),
> `decisions.md` (rationale log), `todos.md` (open / closed items).

## 1. Document Info

| Field | Value |
| --- | --- |
| Slug | `fix-register-page` |
| Step | 2 — Architecture Document |
| Created | 2026-04-25 |
| Last Updated | 2026-04-25 |
| Inputs | `inputs/requirements.md`, `inputs/constraints.md` (no design map; see `decisions.md` → "Skip design map") |
| Pattern source | `features/posts/{post.repository,post.service,dto/create-post.dto,schemas/create-post.schema,actions/createPost,components/createPostForm,components/createPostFormBody}.{ts,tsx}` |

> **Template note.** The skill at `.cursor/skills/architecture-discovery/SKILL.md`
> references `templates/architecture.md` and `templates/refinement-checklist.md`,
> which do not exist in the repo. This document was improvised against the
> SKILL.md Step 2 section list ("Document Info, Project Overview, Existing
> Implementation, Proposed Solution, User-Facing Behavior, Implementation
> Details, Risks/Open Questions, References") with sections that don't apply
> removed. It is intended to double as the seed for a future
> `templates/architecture.md`.

## 2. Project Overview

`/register` is broken: the page calls `signIn('credentials', …)` directly
without ever creating a `User` row, so login fails on the very next step
because no record exists to match against. `/users/new` is a duplicate
admin-area registration form that is *also* broken — it writes
`password: ''` to the database with a comment claiming NextAuth fills it in
later, which it does not.

The goal is to wire `/register` to a real "create user" backend path
following the codebase's NestJS-shaped DTO → Repository → Service
convention, delete the broken `/users/new` page, and add proportionate
test coverage. No schema changes; no migrations.

## 3. Existing Implementation

### `/register` (broken)

`app/register/page.tsx` ([source][register-current]):

- Single 130-line client component.
- `useState<string | null>(null)` for the error.
- `handleSubmit` calls `signIn('credentials', { ...Object.fromEntries(formData), redirect: false })`.
- On success → `router.push('/')` + `router.refresh()`.
- On failure → `setError('Failed to sign in after registration')`.

There is no call to `prisma.user.create` anywhere in the flow. The
`Credentials` provider (`lib/auth/verifyLoginRequest.ts`) does
`prisma.user.findUnique` + `bcrypt.compare`; it never creates rows. So
`signIn` always returns an `error` for a brand-new email, the user sees
"Failed to sign in after registration," and no record is persisted.

### `/users/new` (broken duplicate)

`app/users/new/page.tsx` ([source][users-new-current]):

- Inline `'use server'` action that writes `password: ''`:

```16:18:app/users/new/page.tsx
    await prisma.user.create({
      data: { email, firstName, lastName, password: '', username }, // password will be added by NextAuth
    })
```

- The comment is wrong — NextAuth doesn't write back to the DB.
- The route is admin-gated by `proxy.ts` (`config.matcher` includes
  `/users/new`) and by the route's `ROUTES.newUser` constant in
  `globals/constants/routes.ts`.

### What's already in place

- `User` model has every field the form collects plus `roles` (default
  `[USER]`), `id`, `createdAt`, `updatedAt`. `email` and `username` are
  `@unique`. See `prisma/schema.prisma`.
- `bcryptjs` is installed and used by `verifyLoginRequest`
  (`bcrypt.compare`) and `seedUsers` (`bcrypt.hash` with rounds `10`).
- `userFactory` (`test/factories/user.ts`), `ADMIN_USER`, `BASIC_USER`
  fixtures (`test/fixtures/users.ts`) exist — no new factory work
  needed.
- `setupTestDatabase({ mutatesData: true })` cleans up `prisma.user` and
  `prisma.post` rows after each test (`test/helpers/utils/setupTestDatabase.ts`).
- The `features/posts/*` layer is the canonical "create entity from
  request" pattern: DTO → Schema → Repository → Service → Action →
  Form (orchestrator) → FormBody (presenter) → Page (thin entry).

## 4. Proposed Solution

Build a `features/users/*` slice that mirrors the `features/posts/*`
shape for `create`, delete the broken admin page, and rewrite the
register page as a thin entry point over a new `RegisterForm`.

```
features/users/                            (new)
├── actions/
│   ├── createUser.ts                      (new)
│   ├── index.ts                           (new)
│   └── __tests__/
│       └── createUser.db.test.ts          (new — combined unit+integration)
├── components/
│   ├── index.ts                           (new)
│   ├── registerForm/
│   │   ├── registerForm.tsx               (new — orchestrator)
│   │   ├── index.ts                       (new — barrel)
│   │   └── __tests__/
│   │       └── registerForm.test.tsx      (new)
│   └── registerFormBody/
│       ├── registerFormBody.tsx           (new — presenter)
│       ├── index.ts                       (new — barrel)
│       └── __tests__/
│           └── registerFormBody.test.tsx  (new)
├── constants/
│   └── index.ts                           (new — REGISTRATION_FAILED_MESSAGE)
├── dto/
│   ├── create-user.dto.ts                 (new)
│   ├── index.ts                           (new)
│   └── __tests__/
│       └── create-user.dto.test.ts        (new)
├── schemas/
│   ├── create-user.schema.ts              (new)
│   └── index.ts                           (new)
├── types/
│   ├── createUserState.ts                 (new)
│   └── index.ts                           (new)
├── user.repository.ts                     (new)
├── user.service.ts                        (new)
└── __tests__/
    ├── user.repository.test.ts            (new — prismaMock)
    └── user.service.test.ts               (new — mocked repo)

app/register/page.tsx                      (rewritten — thin entry)
app/register/__tests__/register.page.test.tsx  (new)

app/users/new/page.tsx                     (deleted)
app/users/new/                             (directory removed)

proxy.ts                                   (matcher loses '/users/new')
globals/constants/routes.ts                (loses ROUTES.newUser)
```

The cleanup steps (`/users/new` page deletion + `proxy.ts` matcher prune
+ `ROUTES.newUser` removal) ship in the same change set so the dead
route never resolves to a 500 between commits.

## 5. User-Facing Behavior

### Registration flow

1. User navigates to `/register`. Page renders the form (5 fields:
   First Name, Last Name, Username, Email, Password) plus a "Sign in"
   link to `/login`.
2. User fills the form and submits.
3. **Validation** (Zod, in `createUserSchema`):
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
   server-side via `logger.error` for engineer debugging.
6. **Success** → action calls `redirect(ROUTES.login)`. User lands on
   `/login` with no auto-fill; they sign in manually with the email +
   password they just typed. (No `?registered=true` notice; see
   `decisions.md` → "Withdraw `?registered=true` follow-up.")

### Out of flow

- `/users/new` returns 404 after this change. There is no replacement
  admin-create-user UI in scope.
- `ADMIN`-scoped policy `users.create: true` remains in
  `lib/permissions/constants.ts` — no caller, but ready for a future
  admin tool. See §6.2 below.

## 6. Implementation Details

### 6.1. Data Model

No schema changes. Constraints relevant to this work:

| Field | Constraint | Implication |
| --- | --- | --- |
| `User.email` | `@unique` | Duplicate → `P2002` on `email`. |
| `User.username` | `@unique` | Duplicate → `P2002` on `username`. |
| `User.password` | `String` (required) | Stored as bcrypt hash, never the plaintext. |
| `User.roles` | `UserRole[]` `@default([USER])` | New users default to `USER`. |
| `User.id` | `String` `@default(cuid())` | Auto-generated; DTO/repo do not set. |

### 6.2. Security

- **Password hashing.** `UserRepository.create` calls
  `bcrypt.hash(params.password, SALT_ROUNDS)` with `SALT_ROUNDS = 10`,
  matching `test/helpers/utils/seedUsers.ts`. The DTO and Service never
  see the hashed value; the Schema never sees the password at all
  beyond validation. See `decisions.md` → "Password hashing lives in
  `UserRepository`."
- **No authentication / authorization on `UserService.create`.**
  Self-registration is anonymous; there is no session to authenticate
  against. This is the codebase's first service method that
  intentionally skips `authenticateAPISession` + `hasPermission`. To
  prevent the pattern from drifting, `user.service.ts` opens with a
  comment block referencing this discovery doc and constraining the
  exception to `create`. See `decisions.md` → "No authorization for
  self-registration."
- **User-enumeration mitigation.** `P2002` on either `email` or
  `username` produces the same generic `REGISTRATION_FAILED_MESSAGE`
  ("Registration failed. Please try again.") that any other persistence
  failure produces. The form gives an attacker no signal about which
  field collided. The full `PrismaError` (including `code`, `target`,
  `meta`) is logged server-side via `logger.error` inside both
  `UserRepository.create` and `UserService.respondWithPrismaError` for
  engineer-visible debugging. See `decisions.md` → "Vague duplicate
  messaging, server-side logging."
- **`POLICIES.ADMIN.users.create: true` retained.** The
  `/users/new` page is being deleted, leaving the policy entry without
  a runtime caller. Left in place — it's policy-correct and ready for a
  future admin-driven user-creation surface; removing it is ahead-of-time
  pruning. (Engineer-judgment call; revisit only if it becomes
  misleading.)
- **Password never echoed back.** `CreateUserState` deliberately omits
  a `password` field. Form values are restored on validation/persistence
  failure for `firstName`, `lastName`, `username`, `email` only. The
  password field re-renders empty.

### 6.3. Backend Routing

**N/A.** No HTTP route is added. `createUser` is a server action that
calls `UserService.create` directly. See `decisions.md` → "Server
action only (no HTTP route)" for the rationale (post HTTP route is
itself slated for deprecation; an unauthenticated public POST endpoint
for user creation would be the wrong direction).

### 6.4. Schema (`features/users/schemas/create-user.schema.ts`)

```typescript
import { infer as zodInfer, object, string } from 'zod'

export const createUserSchema = object({
  email: string().email(),
  firstName: string().min(1),
  lastName: string().min(1),
  password: string()
    .min(8)
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  username: string().min(1),
})

export type CreateUserParams = zodInfer<typeof createUserSchema>
```

The two `password` validations (`min(8)` and the regex) report as two
distinct Zod issues when both fail, so the form can render both
messages next to the password input.

### 6.5. DTO (`features/users/dto/create-user.dto.ts`)

```typescript
import { ZodError } from 'zod'

import { logger } from '@/lib/logger'

import { createUserSchema } from '../schemas'

export class CreateUserDto {
  private formData: FormData

  constructor(formData: FormData) {
    this.formData = formData
  }

  public getParams() {
    const raw = Object.fromEntries(this.formData)
    const { data, error } = createUserSchema.safeParse(raw)
    if (error) {
      logger.error({ error }, 'CreateUserDto Zod error:')
      return error
    }
    return data
  }
}
```

Differences from `CreatePostDto`:

- Constructor takes `FormData`, not `Request`. No JSON parsing, so
  `getParams` is sync and the `RequestJSONError` branch does not exist.
- The DTO never sees the hashed password — it returns the raw string,
  the repository hashes.

### 6.6. Repository (`features/users/user.repository.ts`)

```typescript
import { tryCatch } from '@greenymcgee/typescript-utils'
import bcrypt from 'bcryptjs'
import { ZodError } from 'zod'

import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

import type { CreateUserDto } from './dto/create-user.dto'

const SALT_ROUNDS = 10

export class UserRepository {
  public static async create(dto: CreateUserDto) {
    const params = dto.getParams()
    if (params instanceof ZodError) return params

    const hashedPassword = await bcrypt.hash(params.password, SALT_ROUNDS)

    const { error, response: user } = await tryCatch(
      prisma.user.create({
        data: {
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          password: hashedPassword,
          username: params.username,
        },
      }),
    )
    if (error) {
      const prismaError = new PrismaError(error)
      logger.error(
        { details: prismaError.details, status: prismaError.status },
        'UserRepository Prisma error:',
      )
      return prismaError
    }

    return user
  }
}
```

Differences from `PostRepository.create`:

- No `Session['user']` argument (anonymous create — no `authorId` to
  set).
- No `RequestJSONError` branch (DTO doesn't parse JSON).
- No `Lexical` validation branch (no editor content).
- Hashes the password before write; nothing else does.

### 6.7. Service (`features/users/user.service.ts`)

```typescript
import { errAsync, okAsync } from 'neverthrow'
import { ZodError } from 'zod'

import { CREATED, UNPROCESSABLE_CONTENT } from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'

import type { CreateUserDto } from './dto/create-user.dto'
import { UserRepository } from './user.repository'

/**
 * NOTE: `create` intentionally skips `authenticateAPISession` and
 * `hasPermission`. Self-registration is anonymous by definition; there
 * is no session to consult. This exception is narrow — do not propagate
 * it to other `UserService` methods without an explicit architectural
 * decision. See:
 *   docs/discovery/fix-register-page/architecture/decisions.md
 *     → "No authorization for self-registration"
 */
export class UserService {
  public static async create(dto: CreateUserDto) {
    const user = await UserRepository.create(dto)
    if (user instanceof PrismaError) {
      return this.respondWithPrismaError(user, 'create')
    }
    if (user instanceof ZodError) {
      return this.respondWithZodError(user, 'create')
    }

    const { password: _password, ...publicUser } = user
    return okAsync({ status: CREATED, user: publicUser } as const)
  }

  private static respondWithPrismaError<Err extends Error>(
    error: PrismaError<Err>,
    method: 'create',
  ) {
    logger.error({ error }, `UserService Prisma error: ${method}`)
    return errAsync({
      details: error.details,
      status: error.status,
      type: 'entity' as const,
    } as const)
  }

  private static respondWithZodError(error: ZodError, method: 'create') {
    logger.error({ error }, `UserService Zod error: ${method}`)
    return errAsync({
      details: error,
      status: UNPROCESSABLE_CONTENT,
      type: 'dto' as const,
    } as const)
  }
}
```

Differences from `PostService.create`:

- No `authenticateAPISession` / `hasPermission` branches.
- No `RequestJSONError` branch (DTO doesn't produce one).
- No "entity" `Error` branch (no Lexical content validation).
- Ok payload uses `Omit<User, 'password'>` (defense in depth — see
  `decisions.md` → "Service Ok payload omits `password`").

### 6.8. Server Action (`features/users/actions/createUser.ts`)

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

Differences from `createPost`:

- Calls `UserService.create` directly; no `tryPostNewPost`, no msw
  server, no `cookie`/`session` handling.
- No `unauthorized` / `forbidden` branches (service has no auth gate).
- Generic error message is **not** in the returned state — see §6.10.
- Form values for re-render come from inline
  `Object.fromEntries(formData)` with `password` rest-stripped — no
  separate util. The destructured `_password` is intentionally unused
  (the `_`-prefix follows the same idiom as `_: State` above and
  signals "discard"). Single caller, single concern, one line — no
  helper file is justified. See `decisions.md` → "Drop
  `getRegisterFormValues` helper, inline `Object.fromEntries`."

### 6.9. Action State (`features/users/types/createUserState.ts`)

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

Mirrors `CreatePostState` (form-value preservation + `error?: ZodError`).
No string error field — generic message lives in client state via
`withCallbacks`. See `decisions.md` → "Generic error string via
`withCallbacks`."

### 6.10. Constants (`features/users/constants/index.ts`)

```typescript
export const REGISTRATION_FAILED_MESSAGE =
  'Registration failed. Please try again.'
```

Lives in feature-local `constants/` so the test file and the
`RegisterForm` component import the same source of truth.

### 6.11. Frontend — RegisterForm (orchestrator)

`features/users/components/registerForm/registerForm.tsx`:

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

### 6.12. Frontend — RegisterFormBody (presenter)

`features/users/components/registerFormBody/registerFormBody.tsx`
receives:

| Prop | Type | Purpose |
| --- | --- | --- |
| `defaultEmail` / `defaultFirstName` / `defaultLastName` / `defaultUsername` | `FormDataEntryValue \| null \| undefined` | Re-populate inputs after a failed submit. |
| `errorMessage` | `string` | Generic top-of-form error (set by `withCallbacks`). Empty string when none. |
| `fieldErrors` | `Partial<Record<keyof CreateUserParams, string[]>> \| undefined` | Per-field Zod messages (`state.error?.formErrors.fieldErrors`). |
| `pending` | `boolean` | Disable submit + show spinner. |

Renders five inputs (`firstName`, `lastName`, `username`, `email`,
`password`) with associated `<label>` elements (per VITEST_RULES rule
22 — labels are clickable in tests). Each input shows its `fieldErrors`
list below it via `aria-live="polite"` text. The generic `errorMessage`
block sits above the input group with `role="alert"` and
`data-testid="error-message"` (matching `CreatePostFormBody`'s
convention). Submit button has `data-testid="submit-register-button"`.

### 6.13. Frontend — Page (`app/register/page.tsx`)

Rewrite to a thin entry point:

```tsx
import Link from 'next/link'

import { RegisterForm } from '@/features/users/components'
import { ROUTES } from '@/globals/constants'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <h2
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
          data-testid="register-page-heading"
        >
          Create your account
        </h2>
        <RegisterForm />
        <div className="text-center">
          <Link className="text-blue-600 hover:underline" href={ROUTES.login}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
```

Drops the `signIn` import, the `useState`, the `handleSubmit`, and the
inline `<form>`. The page owns layout + the "Sign in" link only.

### 6.14. Cleanup

| File | Change |
| --- | --- |
| `app/users/new/page.tsx` | Delete file. |
| `app/users/new/` | Remove directory (no other contents). |
| `proxy.ts` | `config.matcher` → `['/posts/new']` (was `['/posts/new', '/users/new']`). |
| `globals/constants/routes.ts` | Remove `newUser: '/users/new'`. |

Grep-confirmed scope: the only runtime caller of `ROUTES.newUser` is
`proxy.ts`'s matcher (literal `'/users/new'`, not the constant — but
the constant's only purpose was that route, so it goes too).

### 6.15. Testing Strategy

The following new test files each follow  `.cursor/rules/VITEST_RULES.mdc`:
factories from `@/test/factories`, fixtures from `@/test/fixtures`,
`it("should …")` phrasing, ≤2 expects per `it`, no `mock`-prefixed
names, no className selectors.

#### `features/users/__tests__/user.repository.test.ts`

Pattern source: `features/posts/__tests__/post.repository.test.ts`.

| Branch | Setup | Assertion |
| --- | --- | --- |
| Zod error from DTO | `new CreateUserDto(formData)` with empty / invalid fields. | Returns `expect.any(ZodError)`. |
| Prisma error from `prisma.user.create` | `prismaMock.user.create.mockRejectedValueOnce(new Error('Bad'))`. | Returns `new PrismaError(error)`. |
| Success | `prismaMock.user.create.mockResolvedValueOnce(userFactory.build())`. | Returns the resolved user; `bcrypt.hash` was called with the raw password and `10` rounds (spy on `bcrypt.hash`). |

The `bcrypt.hash` rounds assertion is the critical signal — it
guarantees production-equivalent hashing (same rounds as
`seedUsers.ts`).

#### `features/users/__tests__/user.service.test.ts`

Pattern source: `features/posts/__tests__/post.service.test.ts`.
Mocks `user.repository`:

```typescript
vi.mock('../user.repository', () => ({
  UserRepository: { create: vi.fn() },
}))
```

| Branch | Repository mock | Service result |
| --- | --- | --- |
| Repo returns `ZodError` | `vi.mocked(UserRepository.create).mockResolvedValueOnce(new ZodError([]))` | `Err({ details: ZodError, status: UNPROCESSABLE_CONTENT, type: 'dto' })` |
| Repo returns `PrismaError` | `vi.mocked(UserRepository.create).mockResolvedValueOnce(new PrismaError(new Error('bad')))` | `Err({ details: PrismaError.details, status: PrismaError.status, type: 'entity' })` |
| Repo returns User | `vi.mocked(UserRepository.create).mockResolvedValueOnce(userFactory.build({ password: 'hashed' }))` | `Ok({ status: CREATED, user })` where `user` does **not** have a `password` key. |

The success-branch test must explicitly assert `password` is absent
from the Ok envelope (this is the test that locks in
`decisions.md` → "Service Ok payload omits `password`").

#### `features/users/actions/__tests__/createUser.db.test.ts`

Pattern source: `features/posts/actions/__tests__/getPost.db.test.ts`
and `deletePost.db.test.ts` — combined unit-with-mocked-service +
integration-with-real-DB layout per `decisions.md` → "Action coverage
as `.db.test.ts` integration."

```typescript
let createSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  createSpy = vi.spyOn(UserService, 'create')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createUser', () => {
  // Mocked-service branches (fast, deterministic):
  //   - Zod error from DTO  → state.error is ZodError, status 'ERROR'
  //   - Entity error from service → state.error undefined, status 'ERROR'
  //   - Unexpected error type → satisfies-never branch logs + ERROR

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true })

    it('should create the user, hash the password, and redirect to /login', async () => {
      const formValues = userFactory.build({ password: 'Testpass1!' })
      const formData = new FormData()
      formData.set('email', formValues.email)
      formData.set('firstName', formValues.firstName)
      formData.set('lastName', formValues.lastName)
      formData.set('password', formValues.password)
      formData.set('username', formValues.username)

      await createUser({ status: 'IDLE' }, formData)

      const persisted = await prisma.user.findUnique({
        where: { email: formValues.email },
      })
      expect(
        await bcrypt.compare(formValues.password, persisted?.password ?? ''),
      ).toBe(true)
      expect(redirect).toHaveBeenCalledWith(ROUTES.login)
    })

    it('should ERROR when a duplicate email is submitted', async () => {
      await seedUsers() // ADMIN_USER + BASIC_USER
      const formData = new FormData()
      formData.set('email', ADMIN_USER.email) // duplicate
      formData.set('firstName', faker.person.firstName())
      formData.set('lastName', faker.person.lastName())
      formData.set('password', 'Testpass1!')
      formData.set('username', `${faker.animal.bear()}_${Date.now()}`)

      const result = await createUser({ status: 'IDLE' }, formData)

      expect(result).toEqual(expect.objectContaining({ status: 'ERROR' }))
      expect(result.error).toBeUndefined() // generic, not Zod
    })
  })
})
```

Key signals exercised:

- `bcrypt.hash` round-trip with the production `SALT_ROUNDS = 10`.
- `P2002` on `email` produces the `entity`-typed `Err` envelope, which
  the action maps to `status: 'ERROR'` with no `error` field (the form
  will show the generic `REGISTRATION_FAILED_MESSAGE` via
  `withCallbacks`).
- `redirect(ROUTES.login)` is called exactly on the success branch.

#### `app/register/__tests__/register.page.test.tsx`

Pattern source: `app/posts/new/__tests__/page.test.tsx`. Trivial since
the page is a thin entry — only render assertions:

| `it` | Setup | Assertion |
| --- | --- | --- |
| should render the heading | `render(<RegisterPage />)` | `getByTestId('register-page-heading').tagName` is `'H1'` (or `'H2'` — whichever the page uses; lock to actual rendered tag). |
| should render the RegisterForm | `render(<RegisterPage />)` | `getByTestId('register-form')` is visible. |
| should render the sign-in link | `render(<RegisterPage />)` | `getByRole('link', { name: /Sign in/i })` has `href === ROUTES.login`. |

Page-level form behavior is NOT retested here — that's
`registerForm.test.tsx`'s job. Following the existing convention
established by `app/posts/new/__tests__/page.test.tsx`.

#### `features/users/components/registerForm/__tests__/registerForm.test.tsx`

Pattern source: `features/posts/components/createPostForm/__tests__/createPostForm.test.tsx`.
Differences:

- No `RichTextEditor` mock (no editor on this form).
- No msw server (action calls service in-process).
- Mock `UserService.create` via `vi.spyOn(UserService, 'create')` to
  drive each branch:

| `it` | Service mock | Assertion |
| --- | --- | --- |
| should render Zod field errors when validation fails | Spy returns `errAsync({ details: ZodError with email + password issues, status: UNPROCESSABLE_CONTENT, type: 'dto' })`. Submit form. | Field error nodes for `email` and `password` are visible. |
| should render the generic error message when persistence fails | Spy returns `errAsync({ details: PrismaError, status: 500, type: 'entity' })`. Submit form. | `getByTestId('error-message')` text matches `REGISTRATION_FAILED_MESSAGE`. |
| should redirect to `/login` upon success | Spy returns `okAsync({ status: CREATED, user: publicUser })`. Submit form. | `mockRouter.pathname` is `ROUTES.login` (or `expect(redirect).toHaveBeenCalledWith(ROUTES.login)`). |

Form values are typed via `userEvent.type(screen.getByLabelText(/Email/), …)`
following VITEST_RULES rule 22 (label-driven selection).

#### `features/users/components/registerFormBody/__tests__/registerFormBody.test.tsx`

Plain presenter test. `PROPS` const for the happy path; per-test
overrides for `errorMessage`, `fieldErrors`, `pending`.

| `it` | Override | Assertion |
| --- | --- | --- |
| should render all five labeled inputs | none | `getByLabelText(/First Name/)` … `getByLabelText(/Password/)` all visible. |
| should render the generic error message | `errorMessage: 'oops'` | `getByTestId('error-message')` text is `'oops'`. |
| should render field-level errors | `fieldErrors: { email: ['Invalid email'] }` | `getByText('Invalid email')` is visible. |
| should disable the submit button while pending | `pending: true` | `getByTestId('submit-register-button')` is disabled. |
| should restore default values | `defaultEmail: 'a@b.com'` | `getByLabelText(/Email/)` has `value === 'a@b.com'`. |

#### `features/users/dto/__tests__/create-user.dto.test.ts`

Pattern source: `features/posts/dto/__tests__/create-post.dto.test.ts`.
Two tests:

| `it` | Setup | Assertion |
| --- | --- | --- |
| should return a Zod error when params are invalid | Empty FormData. | Returns `expect.any(ZodError)`. |
| should return validated params on success | FormData with all five valid fields. | Returns object equal to the input fields. |

### 6.16. Rollout

- Single PR, no feature flag.
- Backward-compatible: `/register` URL unchanged; `/users/new` removal
  is deletion-only (no callers redirecting to it; admin nav doesn't
  link there).
- No data migration required (no schema change).
- After merge, manually verify on staging: register a new account →
  redirected to `/login` → log in with the new credentials → land on
  `/`. Test the duplicate-email path produces the generic error.

## 7. Risks / Open Questions

### Risks (carried from `initial_plan.md`)

| ID | Risk | Mitigation |
| --- | --- | --- |
| R1 | User-enumeration on `/register` via duplicate `email`/`username` messaging. | Generic `REGISTRATION_FAILED_MESSAGE` for all `P2002` cases; full `PrismaError` only logged server-side. |
| R2 | First "anonymous-allowed" backend path (`UserService.create` skips auth). Could become a template for other services skipping auth. | Service file opens with a comment block referencing this discovery doc and constraining the exception to `create`. Reviewer to flag any future `UserService` method that copies the no-auth shape. |
| R3 | No auto-login after registration. UX trade-off, not a defect. | Engineer-accepted. No follow-up planned (see `decisions.md` → "Withdraw `?registered=true` follow-up"). |

### Open Questions

None. All Step-1 Q1–Q8 resolved (see `decisions.md`); the four new
Step-2 architectural decisions (`?registered=true` withdrawal,
`withCallbacks` for the generic error, `password`-stripped Ok payload,
`RegisterForm`/`RegisterFormBody` split) are also resolved.

## 8. References

### Internal

- `inputs/requirements.md`
- `inputs/constraints.md`
- `initial_plan.md`
- `decisions.md`
- `todos.md`

### Pattern source files

- `features/posts/post.repository.ts` — repository shape (Prisma + `tryCatch` + error-as-value).
- `features/posts/post.service.ts` — service shape (neverthrow `errAsync`/`okAsync`, error envelopes, `respondWith*` helpers).
- `features/posts/dto/create-post.dto.ts` — DTO shape (Zod `safeParse` + error-as-value).
- `features/posts/schemas/create-post.schema.ts` — schema shape.
- `features/posts/actions/createPost.ts` — server-action shape (with the difference that it goes through msw via `tryPostNewPost`).
- `features/posts/actions/__tests__/getPost.db.test.ts` — `.db.test.ts` integration pattern.
- `features/posts/actions/__tests__/deletePost.db.test.ts` — combined mocked-service + integration `.db.test.ts` pattern.
- `features/posts/components/createPostForm/createPostForm.tsx` — orchestrator pattern (`useActionState` + `withCallbacks`).
- `features/posts/components/createPostFormBody/createPostFormBody.tsx` — presenter pattern.
- `features/posts/components/createPostForm/__tests__/createPostForm.test.tsx` — form-test pattern.
- `app/posts/new/page.tsx` — thin-entry-point page pattern.
- `app/posts/new/__tests__/page.test.tsx` — thin-page-test pattern.
- `lib/auth/verifyLoginRequest.ts` — bcrypt usage symmetry (`compare` ↔ our `hash`).
- `test/helpers/utils/seedUsers.ts` — bcrypt salt rounds reference (`10`).
- `test/helpers/utils/setupTestDatabase.ts` — DB setup/teardown with `mutatesData: true`.
- `test/factories/user.ts` + `test/fixtures/users.ts` — factories and fixtures used in tests.

### Cross-cutting rules

- `AGENTS.md` — high-level architecture, NestJS-shaped backend layering note.
- `.cursor/skills/clean-authoring/SKILL.md` — thin entry points + orchestrator/presenter split.
- `.cursor/rules/VITEST_RULES.mdc` — test-authoring rules.
- `.cursor/skills/architecture-discovery/SKILL.md` — this discovery process.

### External

- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing.
- [Zod](https://zod.dev) — schema validation.
- [Neverthrow](https://github.com/supermacro/neverthrow) — `Result` envelopes.
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) — `useActionState` + `'use server'`.

[register-current]: ../../../../app/register/page.tsx
[users-new-current]: ../../../../app/users/new/page.tsx
