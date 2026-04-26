# fix-register-page — Architecture (Structured)

> Structured form of [`../architecture.md`](../architecture.md). The
> monolithic doc is retained as a single-file reference; this directory
> is the active working copy. Decisions log:
> [`../decisions.md`](../decisions.md). Open todos:
> [`../todos.md`](../todos.md). Status:
> [`../status.md`](../status.md).

## Which Doc Do I Need?

| If you need to … | Read |
| --- | --- |
| Understand why `/register` is broken today | [`./existing-implementation.md`](./existing-implementation.md) |
| See the full file-tree of new/changed/deleted files | [`./proposed-solution.md`](./proposed-solution.md) |
| Know what the user sees end-to-end | [`./user-facing-behavior.md`](./user-facing-behavior.md) |
| Know which `User` columns / validations apply | [`./data-models.md`](./data-models.md) |
| Implement the Zod schema | [`./backend/schema.md`](./backend/schema.md) |
| Implement the DTO | [`./backend/dto.md`](./backend/dto.md) |
| Implement the repository (where bcrypt lives) | [`./backend/repository.md`](./backend/repository.md) |
| Implement the service (and the no-auth comment block) | [`./backend/service.md`](./backend/service.md) |
| Implement the server action | [`./backend/action.md`](./backend/action.md) |
| Get the `CreateUserState` shape right | [`./backend/action-state.md`](./backend/action-state.md) |
| Implement the form components | [`./frontend/components.md`](./frontend/components.md) |
| Wire `useActionState` + `withCallbacks` correctly | [`./frontend/state-management.md`](./frontend/state-management.md) |
| Rewrite `app/register/page.tsx` (thin entry) | [`./frontend/README.md`](./frontend/README.md) |
| Delete `/users/new` cleanly | [`./cleanup.md`](./cleanup.md) |
| Reason about security trade-offs (no auth, generic errors) | [`./security-considerations.md`](./security-considerations.md) |
| Write tests | [`./testing-strategy.md`](./testing-strategy.md) |
| Ship + verify on staging | [`./rollout-strategy.md`](./rollout-strategy.md) |
| Look up open risks / re-verification items | [`./risks-open-questions.md`](./risks-open-questions.md) |
| See why a decision was made (with alternatives) | [`../decisions.md`](../decisions.md) |

## Document Info

| Field | Value |
| --- | --- |
| Slug | `fix-register-page` |
| Step | 4 — Structure Architecture |
| Created | 2026-04-25 |
| Last Updated | 2026-04-25 |
| Inputs | [`../inputs/requirements.md`](../inputs/requirements.md), [`../inputs/constraints.md`](../inputs/constraints.md) (no design map; see [`../decisions.md`](../decisions.md) → "Skip design map") |
| Pattern source | `features/posts/{post.repository,post.service,dto/create-post.dto,schemas/create-post.schema,actions/createPost,components/createPostForm,components/createPostFormBody}.{ts,tsx}` |
| Monolithic source | [`../architecture.md`](../architecture.md) (kept as reference) |

## Project Overview

`/register` is broken: the page calls `signIn('credentials', …)`
directly without ever creating a `User` row, so login fails on the very
next step because no record exists to match against. `/users/new` is a
duplicate admin-area registration form that is *also* broken — it
writes `password: ''` to the database with a comment claiming NextAuth
fills it in later, which it does not.

The goal is to wire `/register` to a real "create user" backend path
following the codebase's NestJS-shaped DTO → Repository → Service
convention, delete the broken `/users/new` page, and add proportionate
test coverage. No schema changes; no migrations.

### System context

```
                                         ┌─────────────────────────┐
                                         │ app/register/page.tsx   │
                                         │ (thin entry — layout +  │
                                         │  Sign-in link only)     │
                                         └────────────┬────────────┘
                                                      │ renders
                                                      ▼
                              ┌──────────────────────────────────────────┐
                              │ features/users/components/registerForm   │
                              │ (orchestrator: useActionState +          │
                              │  withCallbacks + error useState)         │
                              └────────┬─────────────────────────────────┘
                                       │ wraps Form, renders Body
                                       ▼
                              ┌──────────────────────────────────────────┐
                              │ features/users/components/                │
                              │   registerFormBody (presenter:           │
                              │   5 inputs + error block + submit)        │
                              └────────┬─────────────────────────────────┘
                                       │ submit → action invocation
                                       ▼
                              ┌──────────────────────────────────────────┐
                              │ features/users/actions/createUser        │
                              │ ('use server'; calls service directly,   │
                              │  no HTTP route, no msw, no fetch)         │
                              └────────┬─────────────────────────────────┘
                                       │ new CreateUserDto(formData)
                                       ▼
                              ┌──────────────────────────────────────────┐
                              │ features/users/user.service              │
                              │ (no auth/permission gate — anonymous     │
                              │  create; Ok payload omits password)      │
                              └────────┬─────────────────────────────────┘
                                       │
                                       ▼
                              ┌──────────────────────────────────────────┐
                              │ features/users/user.repository           │
                              │ (bcrypt.hash with SALT_ROUNDS=10,        │
                              │  prisma.user.create, PrismaError wrap)   │
                              └────────┬─────────────────────────────────┘
                                       │
                                       ▼
                              ┌──────────────────────────────────────────┐
                              │ Prisma → PostgreSQL `User` table         │
                              │ (email/username @unique → P2002 on dup)  │
                              └──────────────────────────────────────────┘

         Cleanup (same PR):
           app/users/new/page.tsx      → DELETE
           proxy.ts config.matcher     → drop '/users/new'
           globals/constants/routes.ts → drop ROUTES.newUser
```

## Key Design Decisions

Numbered for cross-reference — each links into [`../decisions.md`](../decisions.md)
for full rationale and alternatives.

1. **Server action only — no HTTP route.** The post HTTP route is
   itself slated for deprecation; adding `POST /api/users` would be the
   wrong direction. ([`../decisions.md`](../decisions.md) → "Server
   action only (no HTTP route)")
2. **No authorization on `UserService.create`.** Self-registration is
   anonymous; the service file ships with a load-bearing comment block
   constraining the no-auth exception to `create`.
   ([`../decisions.md`](../decisions.md) → "No authorization for
   self-registration", [`./backend/service.md`](./backend/service.md))
3. **Password hashing lives in `UserRepository`, not the schema or the
   service.** Keeps Prisma persistence shape cohesive in one file.
   ([`../decisions.md`](../decisions.md) → "Password hashing lives in
   `UserRepository`")
4. **Password policy: `min(8)` + at least one non-alphanumeric, as two
   distinct Zod issues.** So the form can render both messages when
   both fail. ([`../decisions.md`](../decisions.md) → "Password policy:
   min 8 with at least one special character")
5. **Vague duplicate messaging, full `PrismaError` logged
   server-side.** Generic `REGISTRATION_FAILED_MESSAGE` for all
   `P2002` cases mitigates user-enumeration; logs preserve
   debuggability. ([`../decisions.md`](../decisions.md) → "Vague
   duplicate messaging, server-side logging")
6. **Redirect to `/login` after success — no auto-login.**
   ([`../decisions.md`](../decisions.md) → "Redirect to `/login` after
   successful registration")
7. **`useActionState` form pattern — not `useState` + `handleSubmit`.**
   Matches the canonical write-flow pattern.
   ([`../decisions.md`](../decisions.md) → "Form pattern:
   `useActionState`")
8. **Generic error string lives in client `useState` via
   `withCallbacks`, not in `CreateUserState`.** Mirrors
   `CreatePostForm`. ([`../decisions.md`](../decisions.md) → "Generic
   error string via `withCallbacks`",
   [`./frontend/state-management.md`](./frontend/state-management.md))
9. **`UserService.create` Ok payload omits `password`.** Defense in
   depth at the service boundary.
   ([`../decisions.md`](../decisions.md) → "Service Ok payload omits
   `password`")
10. **Page split: `RegisterForm` + `RegisterFormBody`; page becomes
    thin entry.** Mirrors the post pattern; aligns with
    `clean-authoring`. ([`../decisions.md`](../decisions.md) → "Page
    split: `RegisterForm` + `RegisterFormBody`")
11. **Action-state type named `CreateUserState` (verb-first).** Not
    `UserCreateState`. ([`../decisions.md`](../decisions.md) →
    "Action-state type named `CreateUserState`")
12. **No form-values helper — inline `Object.fromEntries` rest-strip in
    the action.** Helper would be fluff; single caller, single line.
    ([`../decisions.md`](../decisions.md) → "Drop
    `getRegisterFormValues` helper, inline `Object.fromEntries`")
13. **Action coverage as `.db.test.ts` (mocked-service branches +
    real-DB integration block).** Catches bcrypt round-trip and
    `P2002` behavior that pure-mock action tests can't.
    ([`../decisions.md`](../decisions.md) → "Action coverage as
    `.db.test.ts` integration")
14. **Withdraw the `?registered=true` follow-up.** Agent speculation,
    never engineer-driven. ([`../decisions.md`](../decisions.md) →
    "Withdraw `?registered=true` follow-up")
15. **Skip the design map.** No Figma frame; design isn't a project
    concern. ([`../decisions.md`](../decisions.md) → "Skip design map")
16. **Delete `app/users/new/page.tsx`.** Broken (writes `password:
    ''`); no admin workflow links to it.
    ([`../decisions.md`](../decisions.md) → "Delete
    `app/users/new/page.tsx`")

## Architecture Docs

### Backend (`./backend/`)

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Overview + routing decision + constants | No HTTP route; server action only. `REGISTRATION_FAILED_MESSAGE` lives feature-local. | [`./backend/README.md`](./backend/README.md) |
| Schema | `min(8)` + non-alphanumeric password, two distinct Zod issues. | [`./backend/schema.md`](./backend/schema.md) |
| DTO | `FormData` in (no `Request`); returns `CreateUserParams \| ZodError`. | [`./backend/dto.md`](./backend/dto.md) |
| Repository | `bcrypt.hash` with `SALT_ROUNDS = 10`; `PrismaError` wrap. | [`./backend/repository.md`](./backend/repository.md) |
| Service | No auth gate (load-bearing comment block); Ok payload `Omit<User, 'password'>`. | [`./backend/service.md`](./backend/service.md) |
| Server action | Calls service directly; redirects to `/login` on success; inline `Object.fromEntries` rest-strip. | [`./backend/action.md`](./backend/action.md) |
| Action state | `CreateUserState` (verb-first); preserves four fields, omits `password`. | [`./backend/action-state.md`](./backend/action-state.md) |

### Frontend (`./frontend/`)

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Overview + page (thin entry) | Page owns layout + Sign-in link only; styling is N/A per constraint #2. | [`./frontend/README.md`](./frontend/README.md) |
| Components | Orchestrator (`RegisterForm`) + presenter (`RegisterFormBody`) split. | [`./frontend/components.md`](./frontend/components.md) |
| State management | Generic error message via `withCallbacks` → client `useState`; field errors + form-value preservation via action state. | [`./frontend/state-management.md`](./frontend/state-management.md) |

### Cross-cutting

| Area | Key decision summary | Doc |
| --- | --- | --- |
| User-facing flow | Five-field form; redirect to `/login` on success; generic error on failure. | [`./user-facing-behavior.md`](./user-facing-behavior.md) |
| Data models | No schema changes; validation layered at the boundary. | [`./data-models.md`](./data-models.md) |
| Security | Bcrypt rounds match seed; no-auth exception narrowed; no password echo; user-enumeration mitigation. | [`./security-considerations.md`](./security-considerations.md) |

### Testing & rollout

| Area | Key decision summary | Doc |
| --- | --- | --- |
| Testing | Six new files; integration test exercises real `bcrypt.hash` round-trip + `P2002` on `email`. | [`./testing-strategy.md`](./testing-strategy.md) |
| Cleanup | `/users/new` page + `proxy.ts` matcher + `ROUTES.newUser` ship in same PR. | [`./cleanup.md`](./cleanup.md) |
| Rollout | Single PR, no flag, no migration, manual staging verification. | [`./rollout-strategy.md`](./rollout-strategy.md) |

### Reference

| Area | Doc |
| --- | --- |
| Existing implementation (broken `/register` + `/users/new`) | [`./existing-implementation.md`](./existing-implementation.md) |
| Proposed solution (file tree + scope) | [`./proposed-solution.md`](./proposed-solution.md) |
| Risks + open questions | [`./risks-open-questions.md`](./risks-open-questions.md) |
| Decisions log (append-only) | [`../decisions.md`](../decisions.md) |
| Open todos (engineer + skill) | [`../todos.md`](../todos.md) |
| Status (step tracker) | [`../status.md`](../status.md) |

## Existing Patterns Reused

| Concern | Pattern source | Notes |
| --- | --- | --- |
| Repository (Prisma + `tryCatch` + error-as-value) | `features/posts/post.repository.ts` `create` method | Same shape, no `Session['user']` arg, hashes before write. |
| Service (neverthrow `result.match`, error envelopes, `respondWith*` helpers) | `features/posts/post.service.ts` | Auth/perm + Lexical branches omitted. Ok payload strips `password`. |
| DTO shape | `features/posts/dto/create-post.dto.ts` | `FormData` instead of `Request`; sync `getParams`. |
| Schema | `features/posts/schemas/create-post.schema.ts` | Same Zod idioms; password regex is the only added stateful check. |
| Action with `useActionState` | `features/posts/actions/createPost.ts` | No msw / no `tryPostNewPost`; calls service directly. |
| `.db.test.ts` integration | `features/posts/actions/__tests__/{getPost,deletePost}.db.test.ts` | Combined mocked-service + real-DB layout. |
| Form orchestrator (`useActionState` + `withCallbacks`) | `features/posts/components/createPostForm/createPostForm.tsx` | Minus session/permission gate and rich-text editor. |
| Form presenter | `features/posts/components/createPostFormBody/createPostFormBody.tsx` | Same prop conventions, same testid scheme. |
| Thin-entry page | `app/posts/new/page.tsx` | Layout + link to action surface only. |
| Page test | `app/posts/new/__tests__/page.test.tsx` | Render-only; behavior tested at the form layer. |
| Bcrypt usage | `lib/auth/verifyLoginRequest.ts` (`bcrypt.compare`) + `test/helpers/utils/seedUsers.ts` (`bcrypt.hash` rounds=10) | New code uses `bcrypt.hash` symmetrically; rounds match the seed standard. |
| Factories + fixtures | `test/factories/user.ts`, `test/fixtures/users.ts` | Already exist; integration test uses them as-is. |
| DB setup/teardown | `test/helpers/utils/setupTestDatabase.ts` (`mutatesData: true`) | Truncates `User` between tests so duplicate-email test starts clean. |

## MVP Constraints

From [`../inputs/constraints.md`](../inputs/constraints.md):

1. **No models are changing, and no migrations are allowed.** Honored
   throughout; the `User` table already carries every field the form
   collects.
2. **Design is not a key concern.** Honored — no `frontend/styling.md`;
   page Tailwind classes carry over from the existing register page
   (see [`./frontend/README.md`](./frontend/README.md)).

## References

### External

- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing.
- [Zod](https://zod.dev) — schema validation.
- [Neverthrow](https://github.com/supermacro/neverthrow) — `Result` envelopes.
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) — `useActionState` + `'use server'`.

### Cross-cutting rules in this repo

- [`AGENTS.md`](../../../../../AGENTS.md) — high-level architecture, NestJS-shaped backend layering note.
- [`.cursor/skills/clean-authoring/SKILL.md`](../../../../../.cursor/skills/clean-authoring/SKILL.md) — thin entry points + orchestrator/presenter split.
- [`.cursor/rules/VITEST_RULES.mdc`](../../../../../.cursor/rules/VITEST_RULES.mdc) — test-authoring rules.
- [`.cursor/skills/architecture-discovery/SKILL.md`](../../../../../.cursor/skills/architecture-discovery/SKILL.md) — this discovery process.
