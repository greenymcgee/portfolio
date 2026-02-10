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
npm install
```

### 3. Create a Prisma Postgres instance using Docker Compose

Create a Postgres instance by running the following command:

```
docker compose up -d
```

### 4. Migrate the database

Run the following command to set up your database and Prisma schema:

```bash
npm run dev:db:migrate
```

### 5. Seed the database

Add initial data to your database:

```bash
npm run dev:db:seed
```

### 6. Run the app

Start the development server:

```bash
npm run dev
```

Once the server is running, visit `http://localhost:3000` to start using the app.

## Prisma Docs

- [Prisma ORM documentation](https://www.prisma.io/docs/orm)
- [Prisma Client API reference](https://www.prisma.io/docs/orm/prisma-client)

## Unit Testing Database Code

Before running tests, you need to migrate your test database with this command:

```bash
npm run test:db:migrate
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
