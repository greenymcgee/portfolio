# Schema — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.4.

File: `features/users/schemas/create-user.schema.ts` (new).

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

## Notes

- The two `password` validations (`min(8)` and the regex) report as two
  distinct Zod issues when both fail, so the form can render both
  messages next to the password input.
- The schema does **not** transform the password (no hashing here).
  Hashing lives in [`./repository.md`](./repository.md). See
  [`../../decisions.md`](../../decisions.md) → "Password hashing lives in
  `UserRepository`" for the rationale.
- `CreateUserParams` is the only export consumers use beyond the schema
  itself (the DTO uses `safeParse`, the form-body uses
  `Partial<Record<keyof CreateUserParams, string[]>>` for field-error
  shape — see [`../frontend/components.md`](../frontend/components.md)).

## Pattern source

`features/posts/schemas/create-post.schema.ts`. Differences:

- No `content` (Lexical) branch.
- No `authorId` (anonymous create — no `Session['user']`).
- `password` regex is the only stateful validation idiom; everything
  else is `string().min(1)` / `email()`.
