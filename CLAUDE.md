# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                  # start dev server (output piped through pino-pretty)
pnpm lint                 # ESLint, zero warnings allowed
pnpm tsc                  # type-check only
pnpm spellcheck           # cspell across all files
pnpm test                 # run all tests (watch mode, loads .env.test)
pnpm test:coverage        # single run with V8 coverage
pnpm validate             # tsc + lint + spellcheck + test:coverage (CI gate)
```

**Database (development)**
```bash
docker compose up -d           # start local Postgres
pnpm dev:db:migrate            # apply migrations against dev DB
pnpm dev:db:seed               # seed dev DB
pnpm dev:db:reset              # reset dev DB
```

**Database (test)**
```bash
pnpm test:db:migrate           # apply migrations against test DB (required before first run)
pnpm test:db:reset             # reset test DB
```

**Run a single test file**
```bash
pnpm test path/to/file.test.ts
```

Database tests are in `*.db.test.ts` files and run in a separate Vitest project (`name: 'db'`) with `maxWorkers: 1` to avoid parallelism issues. All other tests run in jsdom.

## Architecture

### Directory layout

```
app/              Next.js App Router pages and layouts
features/         Feature-sliced modules (posts, login, users, landing)
globals/          Cross-cutting components, constants, facades, providers
lib/              Shared utilities (auth, db, lexical, permissions, errors)
providers/        React context providers
test/             Factories, fixtures, helpers, MSW servers, mocks
types/            Global TypeScript types
prisma/           Schema and migrations
```

### Feature module structure

Each feature under `features/` follows this layout:

```
actions/       'use server' server actions (the public write API)
components/    React components scoped to this feature
dto/           Data Transfer Objects — validate and shape incoming data
hooks/         Client-side hooks
schemas/       Zod schemas used by DTOs
types/         Feature-local TypeScript types
post.service.ts    Auth/authz + orchestration
post.repository.ts Database calls via Prisma
```

### Server action pattern

Every write flows: **Action → DTO → Service → Repository → `Result`**.

- DTOs are classes that validate input with Zod in the constructor. `dto.params` returns either the validated data or a `ZodError`/`Error`.
- Services call `authenticateAPISession()` then `hasPermission()` before delegating to the repository.
- Results use **neverthrow** (`okAsync` / `errAsync`). Actions call `.match()` to handle success and typed error branches.
- On success, actions call `revalidateTag(CACHE_TAGS.*)` then `redirect(...)`.

### Caching

Read actions use `'use cache'` with `cacheTag()`:

```ts
'use cache'
cacheTag(CACHE_TAGS.posts)   // invalidated by revalidateTag(CACHE_TAGS.posts)
```

Write actions call `revalidateTag` with the relevant tag(s) before redirecting. `CACHE_TAGS` lives in `globals/constants/cacheTags.ts`.

### Admin menu pattern

The sticky `AdminMenu` bar is populated via `AdminMenuProvider` context. Feature pages render an `AdminMenuContentSetter` (or equivalent) that calls `setContent(...)` to inject feature-specific buttons into the menu. `AdminMenuDialog` reads that content and renders it inside a native popover. Feature-specific content components (e.g. `PostPageAdminMenuContent`) live inside the feature's `components/` directory.

### RichTextEditor

`RichTextEditor` (`globals/components/richTextEditor/`) wraps Lexical. It creates its own `LexicalComposer` internally. `ToolbarPlugin` uses `useLexicalComposerContext()` and must be a descendant of a `LexicalComposer`. When the toolbar needs to render outside the editor's DOM subtree (e.g. in an action bar), the wrapping `LexicalComposer` must be lifted to a common ancestor and `RichTextEditor` must be rendered with `omitToolbar`.

The headless editor used for DTO content validation lives in `lib/lexical/`.

## Testing

### Test projects

| Project | Files | Environment |
|---------|-------|-------------|
| `default` | `*.test.ts`, `*.test.tsx` | jsdom + Prisma mock |
| `db` | `*.db.test.ts`, `*.db.test.tsx` | node + real test DB |

### Key test utilities (import from `@/test/helpers/utils`)

- `mockServerSession(user | null)` — mock a session without a DB
- `mockServerSessionAsync('ADMIN' | ...)` — mock a session with a real test DB; returns the token
- `renderWithProviders(<C />)` — RTL render with all app providers
- `setupTestDatabase({ withUsers })` — sets up and tears down a real test DB for `db` tests
- `createJWTMock(user)` — build a JWT token from a user object

### Factories and fixtures

Always prefer **factories** over manually created objects:

```ts
import { postFactory } from '@/test/factories'
const post = postFactory.build({ title: faker.book.title() })
// Use .associations() for related fields, NOT build() params
const post = postFactory.associations({ authorId: user.id }).build()
```

Use **fixtures** (`@/test/fixtures`) for well-known, shared reference data (`PUBLISHED_POST`, `UNPUBLISHED_POST`, etc.).

Never hard-code strings that duplicate factory or fixture output — always reference the built object's property.

### Test rules (from `.cursor/rules/VITEST_RULES.mdc`)

- `it` over `test`; top-level describe: `describe("<Component />", () => {})`
- No abbreviations, no conditional logic in tests
- Vitest globals are enabled — don't import `it`, `describe`, `expect`
- `const PROPS: PropsOf<typeof Component> = { ... }` for component happy-path props
- Max two `expect` per `it` block
- Use `fireEvent` before reaching for `userEvent`
- Test empty renders with `expect(container).toBeEmptyDOMElement()`
- Never import from `app/` into `test/`
- Mock names drop the `mock` prefix: `const onClick = vi.fn()` not `mockOnClick`
