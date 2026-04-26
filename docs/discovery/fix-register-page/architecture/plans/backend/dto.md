# DTO — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.5.

File: `features/users/dto/create-user.dto.ts` (new).

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

## Differences from `CreatePostDto`

- Constructor takes `FormData`, not `Request`. No JSON parsing, so
  `getParams` is sync and the `RequestJSONError` branch does not exist.
- The DTO never sees the hashed password — it returns the raw string,
  the repository hashes. See [`./repository.md`](./repository.md).

## Why `FormData` over `Request`

The `createUser` action is a Next.js server action invoked via
`useActionState`, which provides `FormData` directly. There is no HTTP
route in front of the service (see
[`../../decisions.md`](../../decisions.md) → "Server action only (no
HTTP route)"), so wrapping in `Request` would be ceremony with no real
gain.
