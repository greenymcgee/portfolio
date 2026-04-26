# Rollout — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §6.16.

## Shape

- **Single PR.** New `features/users/*` slice + register-page rewrite +
  `/users/new` cleanup all ship together. The cleanup must land with
  the rewrite so the dead admin route never resolves to a 500 between
  commits. See [`./cleanup.md`](./cleanup.md) for the file list.
- **No feature flag.** Self-registration is the existing surface
  behavior; the change is "make it actually work" rather than "introduce
  a new opt-in capability." Gating it behind a flag would add ceremony
  with no real rollout-risk reduction.
- **Backward-compatible.** `/register` URL unchanged; `/users/new`
  removal is deletion-only (no callers redirecting to it; admin nav
  doesn't link there).
- **No data migration.** Constraint #1 in
  [`../inputs/constraints.md`](../inputs/constraints.md) — no schema
  changes. The existing `User` table already carries every column the
  new code writes.

## Pre-merge checklist

| Check | Where |
| --- | --- |
| `ROUTES.newUser` re-grep returns zero hits beyond the deletions | [`./cleanup.md`](./cleanup.md) "Grep-confirmed scope" |
| Literal `'/users/new'` re-grep returns zero hits beyond `proxy.ts` matcher edit | [`./cleanup.md`](./cleanup.md) |
| All six test files green locally and in CI | [`./testing-strategy.md`](./testing-strategy.md) |
| `vi.mock('bcryptjs')` not used anywhere new — real bcrypt round-trip is the integration signal | [`./testing-strategy.md`](./testing-strategy.md) "createUser.db.test.ts" |
| `user.service.ts` ships with the no-auth comment block intact | [`./backend/service.md`](./backend/service.md) "The opening comment block is load-bearing" |

## Manual staging verification

After merge, manually verify on staging:

1. Register a new account via `/register`.
2. Confirm browser lands on `/login` after submit (no auto-fill).
3. Sign in with the new credentials → land on `/`.
4. Re-submit `/register` with the same email → confirm the generic
   error message appears (not a field-specific "email already in use").
5. Hit `/users/new` → confirm 404.

Server-side: tail logs during step 4 and confirm a `UserRepository
Prisma error:` (or `UserService Prisma error: create`) entry with
`code: 'P2002'` and the colliding field in `details.target` —
verifying the engineer-debuggability mitigation described in
[`./security-considerations.md`](./security-considerations.md).

## Rollback

If the new flow fails on staging or in production:

1. Revert the single PR (no migration to undo, so revert is purely
   code).
2. Surface symptom + log excerpt in `risks-open-questions.md`
   ([`./risks-open-questions.md`](./risks-open-questions.md)) for
   re-discovery.

The pre-existing broken state (`/register` calling `signIn` against a
non-existent user) is what the revert restores. Not a worse position
than before the PR — just the bug the PR was fixing returns.
