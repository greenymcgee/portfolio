# Backend — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.3, §6.10.

The backend slice mirrors `features/posts/*` for `create`, with three
intentional omissions: no HTTP route, no auth/permission gate, and no
`Lexical`/rich-text branch.

## Layer map

| Layer | File | Detail |
| --- | --- | --- |
| Schema | [`./schema.md`](./schema.md) | `createUserSchema` (Zod) — five-field validation. |
| DTO | [`./dto.md`](./dto.md) | `CreateUserDto` — `FormData` in, `CreateUserParams \| ZodError` out. |
| Repository | [`./repository.md`](./repository.md) | `UserRepository.create` — bcrypt hash + `prisma.user.create` + `PrismaError` wrap. |
| Service | [`./service.md`](./service.md) | `UserService.create` — neverthrow envelope + `Omit<User, 'password'>` Ok payload. |
| Action | [`./action.md`](./action.md) | `createUser` server action — calls service, redirects on success. |
| Action state | [`./action-state.md`](./action-state.md) | `CreateUserState` — form-value preservation + `error?: ZodError`. |

## Backend Routing — N/A

No HTTP route is added. `createUser` is a server action that calls
`UserService.create` directly. See [`../../decisions.md`](../../decisions.md)
→ "Server action only (no HTTP route)" for the rationale (post HTTP
route is itself slated for deprecation; an unauthenticated public POST
endpoint for user creation would be the wrong direction).

## Constants (`features/users/constants/index.ts`)

```typescript
export const REGISTRATION_FAILED_MESSAGE =
  'Registration failed. Please try again.'
```

Lives in feature-local `constants/` so the test file and the
`RegisterForm` component import the same source of truth. Only consumer
on the backend is the comment trail in [`./service.md`](./service.md);
runtime consumer is [`../frontend/state-management.md`](../frontend/state-management.md).
