# Testing Strategy — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §6.15.

Seven new test files. Each follows `.cursor/rules/VITEST_RULES.mdc`:
factories from `@/test/factories`, fixtures from `@/test/fixtures`,
`it("should …")` phrasing, ≤2 expects per `it`, no `mock`-prefixed
names, no className selectors.

## File map

| File | Pattern source | Layer |
| --- | --- | --- |
| `features/users/__tests__/user.repository.test.ts` | `features/posts/__tests__/post.repository.test.ts` | Repository (mocked Prisma) |
| `features/users/__tests__/user.service.test.ts` | `features/posts/__tests__/post.service.test.ts` | Service (mocked repo) |
| `features/users/actions/__tests__/createUser.db.test.ts` | `features/posts/actions/__tests__/{getPost,deletePost}.db.test.ts` | Action (mocked service) + integration (real DB) |
| `features/users/dto/__tests__/create-user.dto.test.ts` | `features/posts/dto/__tests__/create-post.dto.test.ts` | DTO |
| `features/users/components/registerForm/__tests__/registerForm.test.tsx` | `features/posts/components/createPostForm/__tests__/createPostForm.test.tsx` | Form orchestrator |
| `features/users/components/registerFormBody/__tests__/registerFormBody.test.tsx` | (presenter test, plain props in / output out) | Form presenter |
| `app/register/__tests__/register.page.test.tsx` | `app/posts/new/__tests__/page.test.tsx` | Page (thin-entry render assertions) |

## `user.repository.test.ts`

| Branch | Setup | Assertion |
| --- | --- | --- |
| Zod error from DTO | `new CreateUserDto(formData)` with empty / invalid fields. | Returns `expect.any(ZodError)`. |
| Prisma error from `prisma.user.create` | `prismaMock.user.create.mockRejectedValueOnce(new Error('Bad'))`. | Returns `new PrismaError(error)`. |
| Success | `prismaMock.user.create.mockResolvedValueOnce(userFactory.build())`. | Returns the resolved user; `bcrypt.hash` was called with the raw password and `10` rounds (spy on `bcrypt.hash`). |

The `bcrypt.hash` rounds assertion is the critical signal — it
guarantees production-equivalent hashing (same rounds as
`seedUsers.ts`). See [`./backend/repository.md`](./backend/repository.md).

## `user.service.test.ts`

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
from the Ok envelope — this is the test that locks in
[`../decisions.md`](../decisions.md) → "Service Ok payload omits
`password`".

## `createUser.db.test.ts`

Combined unit-with-mocked-service + integration-with-real-DB layout
per [`../decisions.md`](../decisions.md) → "Action coverage as
`.db.test.ts` integration".

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
  `withCallbacks` — see [`./frontend/state-management.md`](./frontend/state-management.md)).
- `redirect(ROUTES.login)` is called exactly on the success branch.

## `register.page.test.tsx`

Trivial since the page is a thin entry — only render assertions:

| `it` | Setup | Assertion |
| --- | --- | --- |
| should render the heading | `render(<RegisterPage />)` | `getByTestId('register-page-heading').tagName` is `'H1'` (or `'H2'` — whichever the page uses; lock to actual rendered tag). |
| should render the RegisterForm | `render(<RegisterPage />)` | `getByTestId('register-form')` is visible. |
| should render the sign-in link | `render(<RegisterPage />)` | `getByRole('link', { name: /Sign in/i })` has `href === ROUTES.login`. |

Page-level form behavior is NOT retested here — that's
`registerForm.test.tsx`'s job. Following the existing convention
established by `app/posts/new/__tests__/page.test.tsx`.

## `registerForm.test.tsx`

Differences from `createPostForm.test.tsx`:

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

## `registerFormBody.test.tsx`

Plain presenter test. `PROPS` const for the happy path; per-test
overrides for `errorMessage`, `fieldErrors`, `pending`.

| `it` | Override | Assertion |
| --- | --- | --- |
| should render all five labeled inputs | none | `getByLabelText(/First Name/)` … `getByLabelText(/Password/)` all visible. |
| should render the generic error message | `errorMessage: 'oops'` | `getByTestId('error-message')` text is `'oops'`. |
| should render field-level errors | `fieldErrors: { email: ['Invalid email'] }` | `getByText('Invalid email')` is visible. |
| should disable the submit button while pending | `pending: true` | `getByTestId('submit-register-button')` is disabled. |
| should restore default values | `defaultEmail: 'a@b.com'` | `getByLabelText(/Email/)` has `value === 'a@b.com'`. |

## `create-user.dto.test.ts`

Two tests:

| `it` | Setup | Assertion |
| --- | --- | --- |
| should return a Zod error when params are invalid | Empty FormData. | Returns `expect.any(ZodError)`. |
| should return validated params on success | FormData with all five valid fields. | Returns object equal to the input fields. |
