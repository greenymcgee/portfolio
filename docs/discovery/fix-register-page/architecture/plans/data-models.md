# Data Models — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §6.1.

No schema changes. Constraint #1 in
[`../inputs/constraints.md`](../inputs/constraints.md): no migrations.

## `User` columns relevant to this work

| Field | Constraint | Implication |
| --- | --- | --- |
| `User.email` | `@unique` | Duplicate → `P2002` on `email`. |
| `User.username` | `@unique` | Duplicate → `P2002` on `username`. |
| `User.password` | `String` (required) | Stored as bcrypt hash, never the plaintext. See [`./backend/repository.md`](./backend/repository.md). |
| `User.roles` | `UserRole[]` `@default([USER])` | New users default to `USER`. |
| `User.id` | `String` `@default(cuid())` | Auto-generated; DTO/repo do not set. |

Source: `prisma/schema.prisma`.

## Validation rules (not schema, but enforced at the boundary)

The Zod schema in [`./backend/schema.md`](./backend/schema.md) layers
input validation on top of the Prisma columns:

| Field | Validation | Reason |
| --- | --- | --- |
| `firstName`, `lastName`, `username` | `string().min(1)` | Prisma columns are non-null but accept empty strings; we reject empty submissions at the boundary. |
| `email` | `string().email()` | Format check before hitting Prisma's unique constraint. |
| `password` | `string().min(8)` AND `.regex(/[^A-Za-z0-9]/, …)` | Two distinct Zod issues so the form can render both messages. See [`../decisions.md`](../decisions.md) → "Password policy: min 8 with at least one special character". |
