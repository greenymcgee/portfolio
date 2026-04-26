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

## 2026-04-25 — Withdraw `?registered=true` follow-up

- **Decision:** Drop the speculative `?registered=true` follow-up
  ("Account created — please sign in" notice on `/login`) from the
  plan, todos, and architecture. Supersedes the "Follow-up (deferred…)"
  note appended to the "Redirect to `/login` after successful
  registration" entry above.
- **Why:** Engineer never asked for it. A prior agent introduced the
  idea in `initial_plan.md` R3 and propagated it to `todos.md` and the
  redirect-decision's follow-up note as if it were tracked work.
  Engineer flagged the scope creep. No requirement, no constraint, no
  user signal motivates it; removing it keeps the plan honest.
- **Alternatives considered:** Surface as a real Q (engineer-decision
  pending) — rejected; the right move is to delete agent speculation,
  not formalize it as if the engineer had asked. Keep R3's "Optional
  follow-up" sentence — rejected; it's the trail of the same
  speculation. R3 itself is retained as a one-line UX-trade-off note
  because it honestly describes a deliberate engineer decision.
- **Step:** 2 — Architecture Document (cleanup before drafting)

## 2026-04-25 — Generic error string via `withCallbacks`

- **Decision:** The "Registration failed. Please try again." string
  lives in client `useState` inside `RegisterForm`, set by the
  `withCallbacks(createUser, { onError: () => setErrorMessage(REGISTRATION_FAILED_MESSAGE) })`
  callback (`@greenymcgee/typescript-utils`). The `CreateUserState`
  action-state shape carries form-value preservation and `error?:
  ZodError` only — no string field.
- **Why:** Mirrors `features/posts/components/createPostForm/createPostForm.tsx`,
  which is the canonical "form with action + generic error" pattern in
  this codebase. `withCallbacks` fires `onError` whenever the action
  returns `state.status === 'ERROR'` (the `ActionState` interface from
  `@greenymcgee/typescript-utils`). Keeps `CreateUserState` a near-mirror
  of `PostCreateState` and avoids inventing a parallel error-surfacing
  shape.
- **Alternatives considered:** Add `errorMessage?: string` to
  `CreateUserState` (my initial recommendation) — rejected once the
  `CreatePostForm` precedent surfaced; would have drifted from the
  established pattern with no upside. Reuse `error` as a union of
  `ZodError | string` — rejected; conflates field-level and form-level
  rendering paths.
- **Step:** 2 — Architecture Document
- **Resolves:** "How does the page see the generic error?"

## 2026-04-25 — Service Ok payload omits `password`

- **Decision:** `UserService.create` returns `okAsync({ user, status: CREATED })`
  where `user` is `Omit<User, 'password'>`. The repository returns the
  full `User` row; the service strips `password` before envelope.
- **Why:** Defense in depth. The `createUser` action redirects to
  `/login` immediately on success, so the `user` payload is never
  shipped to the client today, but stripping `password` at the service
  boundary eliminates a foot-gun if any future consumer of the service
  Ok envelope reads or returns the user.
- **Alternatives considered:** Return the full `User` row (mirroring
  `PostService.create` which returns the full `Post`) — rejected; the
  `Post` row has no secret fields, the `User` row does (the bcrypt
  hash). Strip in the repository instead — rejected; the repository's
  job is "Prisma in, entity out," and the column-level Prisma return
  shape should not be lossy at the persistence boundary.
- **Step:** 2 — Architecture Document
- **Resolves:** Service Ok payload shape question.

## 2026-04-25 — Page split: `RegisterForm` + `RegisterFormBody`

- **Decision:** Extract two new components under
  `features/users/components/`:
  - `registerForm/registerForm.tsx` — orchestrator (`'use client'`,
    `useActionState`, `withCallbacks`, error state, wraps Next's `Form`).
  - `registerFormBody/registerFormBody.tsx` — presenter (five inputs,
    error block, submit button; receives `default*` form values,
    `errorMessage`, `fieldErrors`, `pending` as props).

  `app/register/page.tsx` becomes a thin entry point that renders
  `<main>` + `<h2>` + `<RegisterForm />` + the "Already have an
  account? Sign in" `<Link>`.
- **Why:** Mirrors `features/posts/components/{createPostForm,createPostFormBody}/`
  exactly. Aligns with `.cursor/skills/clean-authoring/SKILL.md`:
  - "Thin entry points" — page files exist to wire, not to own logic.
  - "Orchestration vs. presentation" — orchestrator owns state/effects,
    presenter owns output shape.
- **Alternatives considered:** Keep `app/register/page.tsx` as a single
  inline component (today's shape) — rejected; the page would own form
  state, effects, *and* markup, drifting from the post-feature pattern
  for no real reason (registration is simpler than post creation but
  the same split applies). Single `RegisterForm` component without the
  body split — rejected; the orchestrator/presenter split is the
  canonical shape, and the body is testable in isolation when split.
- **Step:** 2 — Architecture Document
- **Resolves:** Frontend componentry layout question.

## 2026-04-25 — Action-state type named `CreateUserState`

- **Decision:** The action-state type is named `CreateUserState` (file
  `features/users/types/createUserState.ts`), not `UserCreateState`.
- **Why:** Engineer-specified. The verb-first form reads as a clear
  English phrase ("create user state") and aligns with the rest of the
  feature's verb-first naming: `createUser` (action), `CreateUserDto`,
  `createUserSchema`, `createUserState`. Matches `clean-authoring`
  guidance that names should be descriptive phrases.
- **Alternatives considered:** `UserCreateState` (mirrors the legacy
  `PostCreateState`) — rejected; the engineer explicitly called the
  legacy name out as a mistake and asked us not to repeat it.
- **Step:** 3 — Iterative Refinement
- **Resolves:** Naming inconsistency surfaced after Step 2 write.

## 2026-04-25 — Form-values helper named `getRegisterFormValues`

- **Decision:** The form-values helper is named `getRegisterFormValues`
  (file `features/users/utils/getRegisterFormValues.ts`), not
  `getUserCreateFormValues`.
- **Why:** Engineer-specified. The helper is scoped to the register
  flow specifically (it reads the four preserved fields from the
  register form's `FormData`), so naming it after the surface that
  produces the data — the register form — reads more accurately than
  a generic `userCreate*` prefix. Aligns with the sibling component
  names `RegisterForm` / `RegisterFormBody` / `register.page.tsx`.
- **Alternatives considered:** `getUserCreateFormValues` (mirrors the
  legacy `getPostCreateFormValues`) — rejected; same reasoning as the
  `CreateUserState` rename. The legacy `*CreateFormValues` shape
  conflates the entity name with the surface, and the engineer prefers
  surface-named helpers when there's only one surface that uses them.
- **Step:** 3 — Iterative Refinement
- **Resolves:** Naming inconsistency surfaced after Step 2 write.
- **Superseded by:** "Drop `getRegisterFormValues` helper, inline
  `Object.fromEntries`" (same day) — the helper itself is removed, so
  this naming decision becomes moot. Kept in the log for traceability.

## 2026-04-25 — Drop `getRegisterFormValues` helper, inline `Object.fromEntries`

- **Decision:** No standalone form-values helper. The action does the
  rest-strip inline:

  ```typescript
  const { password: _password, ...formValues } = Object.fromEntries(formData)
  ```

  Supersedes the prior "Form-values helper named `getRegisterFormValues`"
  decision. The entire `features/users/utils/` directory is removed
  from the plan (no other utils were planned).
- **Why:** Engineer-flagged the helper as fluff after seeing the rest
  of the plan. Trace confirms it: the helper's only consumer is the
  `createUser` action, the operation is one line, and the
  `clean-authoring` SKILL's "When *not* to split" section calls out
  exactly this case ("two halves would always be consumed together
  with no separate reuse or test story" + "split is purely syntactic").
  Inlining keeps the password-stripping intent local to where it
  matters, drops a file, drops a barrel export, drops a (would-be)
  trivial test, and follows the codebase's own `_`-prefix-for-discard
  idiom (`_: State` in this same action).
- **Alternatives considered:** Keep the helper (mirrors the legacy
  `getPostCreateFormValues`) — rejected; legacy `getPostCreateFormValues`
  is the same kind of fluff for the same reason, and the engineer
  doesn't want to repeat the pattern. Use `Object.fromEntries` then
  `delete formValues.password` — rejected; mutation when a non-mutating
  rest-strip is exactly as concise. Use `formData.get('email')` etc.
  inline — rejected; verbose, four duplicated lines instead of one.
- **Out of scope:** The legacy `getPostCreateFormValues` helper at
  `features/posts/utils/getPostCreateFormValues.ts` is the same fluff
  pattern but a separate cleanup; not touched here.
- **Step:** 3 — Iterative Refinement
- **Resolves:** Helper-vs-inline question surfaced after the rename
  decision above.
