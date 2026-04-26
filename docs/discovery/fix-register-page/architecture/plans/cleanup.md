# Cleanup — fix-register-page

> Part of [fix-register-page architecture](./README.md). Source slice:
> [architecture.md](../architecture.md) §6.14.

The cleanup steps ship in the **same change set** as the new code so
the dead route never resolves to a 500 between commits. See
[`./rollout-strategy.md`](./rollout-strategy.md) for sequencing.

## Files to change

| File | Change |
| --- | --- |
| `app/users/new/page.tsx` | Delete file. |
| `app/users/new/` | Remove directory (no other contents). |
| `proxy.ts` | `config.matcher` → `['/posts/new']` (was `['/posts/new', '/users/new']`). |
| `globals/constants/routes.ts` | Remove `newUser: '/users/new'`. |

## Grep-confirmed scope

The only runtime caller of `ROUTES.newUser` is `proxy.ts`'s matcher,
and that matcher uses the literal string `'/users/new'` (not the
`ROUTES.newUser` constant — but the constant's only purpose was that
route, so it goes too).

Verification step before the PR ships: re-grep `ROUTES.newUser` and
literal `'/users/new'` across the repo to confirm no new caller has
been added since this discovery was written.

## Why deletion over keep-as-hidden-admin-tool

See [`../decisions.md`](../decisions.md) → "Delete `app/users/new/page.tsx`".
Summary: the page writes `password: ''` to the DB with a wrong comment
claiming NextAuth fills it in later (it doesn't). It's broken, has no
admin workflow linking to it, and would be a long-term liability if
kept.

## Out of scope

- The `POLICIES.ADMIN.users.create: true` entry in
  `lib/permissions/constants.ts` — left in place. Policy-correct;
  ready for a future admin-driven user-creation surface; removing it
  would be ahead-of-time pruning. See [`./security-considerations.md`](./security-considerations.md).
