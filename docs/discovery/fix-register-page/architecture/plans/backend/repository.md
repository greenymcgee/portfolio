# Repository — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.6.

File: `features/users/user.repository.ts` (new).

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

## Differences from `PostRepository.create`

- No `Session['user']` argument (anonymous create — no `authorId` to
  set).
- No `RequestJSONError` branch (DTO doesn't parse JSON).
- No `Lexical` validation branch (no editor content).
- Hashes the password before write; nothing else does.

## `SALT_ROUNDS = 10`

Matches `test/helpers/utils/seedUsers.ts`. Production-equivalent
hashing is the critical signal exercised by
[`../testing-strategy.md`](../testing-strategy.md) (the `bcrypt.hash`
spy assertion in `user.repository.test.ts` and the
`bcrypt.compare(rawPassword, persisted.password)` assertion in
`createUser.db.test.ts`).

## Why hashing lives here

See [`../../decisions.md`](../../decisions.md) → "Password hashing lives
in `UserRepository`". The Prisma persistence shape (the `password`
column) is owned by this file; concentrating hashing here keeps the
persistence concern cohesive and prevents the DTO/Service/Schema from
needing any awareness of secrets handling.
