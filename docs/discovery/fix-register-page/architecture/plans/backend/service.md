# Service — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.7.

File: `features/users/user.service.ts` (new).

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

## Differences from `PostService.create`

- No `authenticateAPISession` / `hasPermission` branches.
- No `RequestJSONError` branch (DTO doesn't produce one).
- No "entity" `Error` branch (no Lexical content validation).
- Ok payload uses `Omit<User, 'password'>` (defense in depth — see
  [`../../decisions.md`](../../decisions.md) → "Service Ok payload omits
  `password`").

## The opening comment block is load-bearing

The JSDoc block above the class is **architecture as code** — it
anchors back to this discovery doc and constrains the no-auth
exception to `create`. See [`../security-considerations.md`](../security-considerations.md)
("Reviewer rule") for the corresponding review behavior. Removing or
shortening the comment in implementation would silently widen the
exception's blast radius.

## Ok envelope shape

```typescript
{
  status: CREATED,
  user: Omit<User, 'password'>
}
```

The repository returns the full `User` row; the service strips
`password` before envelope. The current consumer (`createUser` action)
redirects to `/login` immediately and never reads the user, but the
strip is defense in depth for any future consumer. See
[`../../decisions.md`](../../decisions.md) → "Service Ok payload omits
`password`" for the alternatives considered.
