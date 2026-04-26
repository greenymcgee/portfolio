# Existing Implementation — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §3.

## `/register` (broken)

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

## `/users/new` (broken duplicate)

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

## What's already in place

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

[register-current]: ../../../../../app/register/page.tsx
[users-new-current]: ../../../../../app/users/new/page.tsx
