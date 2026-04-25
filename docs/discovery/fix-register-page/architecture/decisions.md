# Decisions — fix-register-page

> Append-only log. Each entry: what was decided, why, alternatives considered,
> step it came from.

## 2026-04-25 — Skip design map

- **Decision:** No `inputs/design-map.md` will be created.
- **Why:** No Figma frame exists for the register page. Engineer confirmed
  ("There is not a design for the register page. Skip the design map").
  Constraint #2 also notes design is not a concern for this project.
- **Alternatives considered:** Scaffold an empty design-map for future use —
  rejected as misleading (the architecture doc would advertise a designed
  surface that doesn't exist).
- **Step:** 1 — Setup & Initial Plan

## 2026-04-25 — Reuse posts-feature backend shape

- **Decision:** New code mirrors `features/posts/{post.repository,post.service,dto/create-post.dto,schemas/create-post.schema,actions/createPost}.ts` for shape, error envelopes, and test layout.
- **Why:** Codebase already has one well-tested template for "create an
  entity from a request"; a second feature should not invent a parallel
  pattern. Reuse keeps `AGENTS.md`'s claim of NestJS-like dto/service/repo
  layering true.
- **Alternatives considered:** Inline the create logic in the action (too
  thin a layer — fails the clean-authoring split between orchestration and
  presentation). Skip the DTO and validate in the action (mixes
  validation with orchestration; harder to test in isolation).
- **Step:** 1 — Setup & Initial Plan

## 2026-04-25 — Delete `app/users/new/page.tsx`

- **Decision:** Remove the page (and `ROUTES.newUser` after grep-confirming
  no callers).
- **Why:** Engineer requirement (`requirements.md` step 4). The page is
  broken anyway: it stores `password: ''` with a wrong comment claiming
  NextAuth fills it in. No replacement admin-create-user UI is in scope.
- **Alternatives considered:** Keep it as a hidden admin tool — rejected;
  no admin workflow currently links to it, and it would be a long-term
  liability with the `password: ''` bug.
- **Step:** 1 — Setup & Initial Plan

## 2026-04-25 — Server action only (no HTTP route)

- **Decision:** `createUser` is a server action that calls
  `UserService.create` directly. No `app/api/users/route.ts`, no
  `tryPostNewUser` request helper, no `usersServer` msw setup.
- **Why:** Engineer noted the post HTTP route is itself slated for
  deprecation, so adding a parallel users route would be moving in the
  wrong direction. Server actions also avoid exposing an unauthenticated
  public endpoint for user creation (R6 in `initial_plan.md`).
- **Alternatives considered:** Mirror the post pattern with `POST
  /api/users` for symmetry — rejected as it would be deprecated alongside
  the posts route shortly after.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Q1, Q8 (DTO source — no `Request` involved, takes form
  values).

## 2026-04-25 — No authorization for self-registration

- **Decision:** `UserService.create` performs no `authenticateAPISession`
  or `hasPermission` check. Anyone can call it.
- **Why:** Self-registration is anonymous by definition — there's no
  session to authenticate. No admin-only user creation flow exists in
  scope.
- **Alternatives considered:** Add a `users.register` permission entry
  (yes for both ADMIN and USER) — rejected as ceremony with no real gate;
  there's no logged-in user when the call happens, so the policy table
  wouldn't actually be consulted. Also rejected: split into
  `createSelf` (anonymous) vs `create` (admin-only) — admin-only branch
  has no consumer.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Q2.

## 2026-04-25 — Password policy: min 8 with at least one special character

- **Decision:** `createUserSchema.password` requires `min(8)` and matches
  `/[^A-Za-z0-9]/`. Two distinct Zod issues so validation errors can be
  surfaced individually.
- **Why:** Engineer-specified ("min 8 chars, include a special character
  requirement"). Pragmatic baseline without going overboard for a
  portfolio site.
- **Alternatives considered:** Add explicit upper/lower/number requirements
  — rejected; not requested and adds friction without much real-world
  security gain.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Q3.

## 2026-04-25 — Vague duplicate messaging, server-side logging

- **Decision:** When `UserRepository.create` returns a `PrismaError`
  (including `P2002` unique-constraint failures on `email` or `username`),
  the action surfaces a generic `"Registration failed. Please try again."`
  message to the form. The actual `PrismaError` (with code, target, and
  meta) is logged via the `logger` inside the repository / service layer
  for engineer visibility.
- **Why:** Engineer requested vague messaging to avoid leaking which
  field collided (mitigates user-enumeration on `/register`, R1) while
  still preserving debuggability via logs.
- **Alternatives considered:** Field-specific errors ("Email already in
  use") — rejected per engineer, though it's better UX. Silent log only
  with no user feedback — rejected as worse UX still.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Q4.

## 2026-04-25 — Redirect to `/login` after successful registration

- **Decision:** On successful create, the action calls Next's `redirect`
  to `/login`. The register page does not auto-`signIn` the new user.
- **Why:** Engineer-specified. Simpler control flow (no chained
  `signIn` to handle), avoids the auto-login risks listed in R3, and
  keeps registration cleanly separated from authentication. UX trade-off
  accepted.
- **Alternatives considered:** Auto-`signIn` after create → `router.push('/')`
  — rejected per engineer.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Q5.
- **Follow-up (deferred to refinement / future work):** Optionally pass a
  `?registered=true` query param so `/login` can render an "Account
  created — please sign in" notice. Tracked in `todos.md`.

## 2026-04-25 — Form pattern: `useActionState`

- **Decision:** `app/register/page.tsx` uses `useActionState` with the
  `(state, formData) => Promise<State>` action signature, mirroring
  `features/posts/actions/createPost.ts`.
- **Why:** Engineer-specified. Matches the existing canonical write-flow
  pattern; `handleLoginFormSubmit` callback pattern is a holdover from
  the original template and not the target shape going forward.
- **Alternatives considered:** Keep the current `useState` + manual
  `handleSubmit` — rejected as drift from the established pattern.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Q6.

## 2026-04-25 — Password hashing lives in `UserRepository`

- **Decision:** `UserRepository.create` calls `bcrypt.hash` immediately
  before `prisma.user.create`. The DTO never sees the hashed value; the
  Service has no awareness of hashing.
- **Why:** Engineer-specified. Keeps Prisma persistence shape cohesive
  in one file (the column is `password` and only the repo writes to that
  column). DTO/schema stay focused on validation; Service stays focused
  on orchestration and error mapping.
- **Alternatives considered:** Hash in the Service (splits persistence
  concerns across two files) or via a `transform` in the schema (couples
  validation to a stateful side effect). Both rejected.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** Q7.

## 2026-04-25 — Action coverage as `.db.test.ts` integration

- **Decision:** `createUser` action coverage lives in
  `features/users/actions/__tests__/createUser.db.test.ts`, following
  the existing `getPost.db.test.ts` / `deletePost.db.test.ts` pattern:
  mocked-service branches (`vi.spyOn(UserService, 'create')`) for
  `Zod` / entity / unexpected error paths plus a
  `describe('integration', ...)` block with
  `setupTestDatabase({ mutatesData: true })` that posts real
  `FormData`, queries the real `prisma.user`, asserts
  `bcrypt.compare(rawPassword, user.password)` resolves true, and
  asserts the action redirected to `ROUTES.login`.
- **Why:** Engineer-specified ("createUser action test needs to be a
  .db.test file with an integration test"). Pure-mock action tests
  (like `createPost.test.ts`) can't catch real bcrypt-hash round-trip
  bugs or Prisma unique-constraint behavior on `email`/`username`. The
  hybrid pattern keeps fast branch coverage while exercising the real
  hashing + persistence path end-to-end.
- **Alternatives considered:** Keep a pure-unit `createUser.test.ts`
  with mocked service (matches `createPost.test.ts`) — rejected per
  engineer; loses the bcrypt round-trip and `P2002` integration
  signal. Split into two files (`createUser.test.ts` for unit +
  `createUser.db.test.ts` for integration) — rejected as duplicate
  setup; the existing `.db.test.ts` files combine both layers in one
  file already.
- **Step:** 1 — Setup & Initial Plan
- **Resolves:** New decision (no Q-number; emerged after Q1–Q8 were
  closed).
