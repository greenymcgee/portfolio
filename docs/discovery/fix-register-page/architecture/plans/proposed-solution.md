# Proposed Solution — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §4.

Build a `features/users/*` slice that mirrors the `features/posts/*`
shape for `create`, delete the broken admin page, and rewrite the
register page as a thin entry point over a new `RegisterForm`.

## File tree

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

## Single-PR scope

The cleanup steps (`/users/new` page deletion + `proxy.ts` matcher prune
+ `ROUTES.newUser` removal) ship in the same change set so the dead
route never resolves to a 500 between commits.

## Where to drill in next

| If you need … | Read |
| --- | --- |
| Why this shape vs alternatives | [`../decisions.md`](../decisions.md) |
| The DTO / repo / service / action code shape | [`./backend/`](./backend/README.md) |
| The form components | [`./frontend/components.md`](./frontend/components.md) |
| The cleanup sequence | [`./cleanup.md`](./cleanup.md) |
| The test plan | [`./testing-strategy.md`](./testing-strategy.md) |
| The rollout plan | [`./rollout-strategy.md`](./rollout-strategy.md) |
