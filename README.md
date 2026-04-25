# Houston C. Green Portfolio

This is the repository for my personal portfolio/blog website. It is built with
Next.js, Prisma, and Tailwind CSS.

## Core Technologies

- [Next.js](https://nextjs.org/)
- [NextAuth.js v4](https://next-auth.js.org/)
- [Prisma Postgres](https://www.prisma.io/postgres)
- [Prisma ORM](https://www.prisma.io/orm)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker Compose](https://docs.docker.com/compose/) - for local development and testing
- [GitHub Actions](https://github.com/features/actions)
- [Neverthrow](https://github.com/supermacro/neverthrow)

**Testing**

- [Vitest](https://vitest.dev/)
- [V8 Coverage](https://vitest.dev/guide/coverage.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [msw](https://github.com/mswjs/msw)
- [Faker.js](https://github.com/faker-js/faker)
- [Fishery](https://github.com/thoughtbot/fishery)
- [next-router-mock](https://github.com/scottrippey/next-router-mock)

**Linting & Formatting**

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Spellcheck](https://cspell.org/)

**Logging**

- [Pino](https://github.com/pinojs/pino)

## Getting started

### 1. Set up your `.env` file

First, create a `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

Create an auth secret string using the following command and replace the
`AUTH_SECRET` value in the `.env` file:

```bash
openssl rand -base64 32
```

### 2. Install dependencies

After cloning the repo and navigating into it, install dependencies:

```
pnpm install
```

### 3. Create a Prisma Postgres instance using Docker Compose

Create a Postgres instance by running the following command:

```
docker compose up -d
```

### 4. Migrate the database

Run the following command to set up your database and Prisma schema:

```bash
pnpm run dev:db:migrate
```

### 5. Seed the database

Add initial data to your database:

```bash
pnpm run dev:db:seed
```

### 6. Run the app

Start the development server:

```bash
pnpm run dev
```

Once the server is running, visit `http://localhost:3000` to start using the app.

## Prisma Docs

- [Prisma ORM documentation](https://www.prisma.io/docs/orm)
- [Prisma Client API reference](https://www.prisma.io/docs/orm/prisma-client)

## Running Queries Against the Database

First open a connection to the database using the following command:

```bash
# Replace this with a real connection string
psql "postgresql://user:pass@host:port/db?sslmode=require"
```

Then run queries like this:
```sql
SELECT p.*, u."firstName", u."lastName", u.email
  FROM "Post" p
  JOIN "User" u ON p."authorId" = u.id
  ORDER BY p."createdAt" DESC
  LIMIT 10;
```

## Context

Context for this project can be found in the
[providers](https://github.com/greenymcgee/portfolio/blob/main/providers/)
directory. We'll list the custom contexts below:

- [AdminMenuProvider](https://github.com/greenymcgee/portfolio/blob/main/globals/providers/adminMenu/)
  - This context is for injecting content dynamically into the
  [AdminMenu](https://github.com/greenymcgee/portfolio/blob/main/globals/components/adminMenu/adminMenu.tsx)
  component.
  - For an example, see the
  [PostsAdminMenuSetter](https://github.com/greenymcgee/portfolio/blob/main/features/posts/components/adminMenuContentSetter/adminMenuContentSetter.tsx)
  component.

## Test Utils

- [createJWTMock](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/createJWTMock.ts)
- [factories](https://github.com/greenymcgee/portfolio/blob/main/test/factories/)
- [getApiUrl](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/getApiUrl.ts)
- [mockCookieHeader](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/mockCookieHeader.ts)
- [mockServerSession](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/mockServerSession.ts)
- [mockServerSessionAsync](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/mockServerSessionAsync.ts)
- [renderWithProviders](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/renderWithProviders.tsx)
- [seedPosts](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/seedPosts.ts)
- [seedUsers](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/seedUsers.ts)
- [setupTestDatabase](https://github.com/greenymcgee/portfolio/blob/main/test/helpers/utils/setupTestDatabase.ts)

## Testing Against User Authenticated Code

There are a few utils that make mocking a User server session easier.

### mockServerSession

This util is useful for mocking a User server session for tests that don't
require a test database.

```ts
import { mockServerSession } from '@/test/helpers/utils'

it('should return an unauthorized status when the jwt is null', async () => {
  mockServerSession(null)
  const result = await getServerUser()
  expect(result).toBe(ADMIN_USER)
})
```

### mockServerSessionAsync

This util is useful for mocking a User server session for tests that require a
test database.

```ts
import {
  mockServerSessionAsync,
  setupTestDatabase,
} from '@/test/helpers/utils'

setupTestDatabase({ withUsers: true })

it('should return an ok status and the post when the request succeeds', async () => {
  const token = await mockServerSessionAsync('ADMIN')
  const result = await createPost()
  expect(result).toEqual(
    new Ok({
      post: expect.objectContaining({ authorId: token.id, title }),
      status: SUCCESS,
    }),
  )
})
```

### createJWTMock

A util for mocking a JWT token for the given user.

```ts
import { userFactory } from '@/test/factories'
import { createJWTMock } from '@/test/helpers/utils'

const user = userFactory.build()
const token = createJWTMock(user)
```

### mockCookieHeader

A util for mocking a cookie header when testing against useSession.

```ts
import { mockCookieHeader } from '@/test/helpers/utils'

it('should redirect to the login page when the response is unauthorized', async () => {
  // mocks the cookie required for any request to the API
  await mockCookieHeader()
  mockPostsCreateResponse({
    message: HTTP_TEXT_BY_STATUS[UNAUTHORIZED],
    status: UNAUTHORIZED,
  })
  await createPost({ status: 'IDLE' }, FORM_DATA)
  expect(redirect).toHaveBeenCalledWith(
    ROUTES.loginWithRedirect(ROUTES.newPost),
  )
})
```

### mockAuthSessionResponse

A util for mocking an authenticated user session response using msw.

```ts
import { mockAuthSessionResponse } from '@/test/helpers/utils'

const server = setupServer()

it('should render for an admin user', async () => {
  const { user } = mockAuthSessionResponse(server, { role: 'ADMIN' })
  renderWithProviders(<AnyComponent />)
  expect(screen.getByText(user.firstName)).toBeVisible()
})
```

### SessionStatus

A component for displaying the status of the session only in test environments.
This is useful when there's a need to load something for an admin, but we don't
want to indicate anything is loading visually.

```tsx
import { SessionStatus } from '@/globals/components'

function AnyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading' || !hasPermission(session?.user, 'adminMenu', 'view')) {
    return <SessionStatus status={status} />
  }

  return <div>AnyComponent</div>
}
```

## Unit Testing Database Code

Before running tests, you need to migrate your test database with this command:

```bash
pnpm run test:db:migrate
```

Vitest is the testing framework for this project, and there is a test helper
made specifically for testing code that interacts with the database. It will set
up a test database, seed it with users, and tear down the database after the
tests are run.

```ts
import { setupTestDatabase } from '@/test/helpers/utils'

import { verifyLoginRequest } from '@/lib/auth/verifyLoginRequest'
import { ADMIN_USER } from '@/test/fixtures'

// Includes options for seeding with various data.
setupTestDatabase({ withUsers: true })

it('should return the user upon success', async () => {
  const result = await verifyLoginRequest({
    email: ADMIN_USER.email,
    password: ADMIN_USER.password,
  })
  expect(result.id).toBe(ADMIN_USER.id)
})
```

## Integration Testing React Code

`@testing-library/react` is the core library used for testing React, and `msw`
is our core library for testing API requests. API requests should be to internal
API routes that interact with either auth, the database, or any other services.
This allows the React components to be tested on their own using async requests
to the API endpoints.
