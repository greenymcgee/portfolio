# Naming catalogue

A name is a short English phrase describing what the thing is and where
it belongs. This file is the full reference.

## Pluralization

Pluralization is semantic, not cosmetic.

- Singular: `User`, `Post`, `Order` — represents or operates on one instance.
- Plural: `Users`, `Posts`, `Orders` — represents or operates on a collection.

Applies to:

- Types and classes: `User` vs. `Users` (a registry/collection type).
- Functions: `findUser(id)` vs. `findUsers(criteria)`.
- Modules and folders: `post/` for the single-item concern, `posts/` for the collection.
- Routes and URLs: `/users/:id` (singular resource) vs. `/users` (collection).

When you catch yourself writing `getUser` and `getUserList`, the name is
lying — prefer `getUser` and `getUsers`.

## Location prefixes

Prefix a name with its scope or context when the same role is realized
differently in different places.

- `DetailPage*`, `ListPage*`, `SettingsPage*` — scopes a unit to a specific page or view.
- `Admin*`, `Internal*`, `Public*` — scopes a unit to an audience or permission boundary.
- `Server*`, `Client*` — scopes a unit to a runtime.

A unit named `AdminMenu` means one thing. A unit named `DetailPageAdminMenu`
means exactly one thing in exactly one place — no variant parameter needed.

## Role suffixes

Suffixes communicate the unit's shape. Pick the smallest suffix that
tells the truth.

| Suffix | Role |
|---|---|
| `*Content` | The renderable/output body of a larger shell. |
| `*Body` | The presenter half of an orchestrator/presenter pair. |
| `*Form` | A unit that collects and submits input. |
| `*Setter` | A side-effect unit that writes a value into a parent context and unwinds on teardown. |
| `*Writer` / `*Publisher` | A side-effect unit that emits to an external system. |
| `*Reader` / `*Subscriber` | A side-effect unit that observes an external system. |
| `*Repository` | Persistence boundary; maps between domain objects and a data store. |
| `*Service` | A cohesive set of operations at a boundary between layers. |
| `*Adapter` | Translates one interface into another. |
| `*Handler` | Entry point for an event/message/request. |
| `*Client` | Wraps calls to an external system. |
| `*Factory` | Creates instances in one call, often with sensible defaults or from input data. Returns the finished object. |
| `*Builder` | Fluent, step-by-step construction of a complex object. Carries intermediate state; terminated by a `build()` / `create()` call. |
| `*Policy` | Authorization or business-rule decisions. |

`Factory` and `Builder` solve different problems. A factory is a
one-shot constructor; a builder is an accumulator with a fluent
interface. Don't reach for `Builder` when a factory would do.

Don't stack suffixes. `PostRepositoryService` is two things.

## Handler pairs

External / internal symmetry:

- `onClick`, `onSubmit`, `onContentChange` — callback names consumers pass in.
- `handleClick`, `handleSubmit`, `handleContentChange` — the matching internal implementation.

The `on*` / `handle*` pair lets a reader trace "who raises" vs. "who catches" at a glance.

In non-UI contexts the pair is `on<Event>` (external subscription) vs.
`handle<Event>` (internal consumer), or `emit<Event>` / `receive<Event>`
when directionality matters more than ownership.

## Test naming

- Top-level describe names the unit under test:
  - UI component: `describe('<ComponentName />', …)`.
  - Function/class/module: `describe('functionName', …)` or `describe('ClassName', …)`.
- Spec clauses read as sentences: `it('should behave this way', …)`.
- Avoid `mock*` prefixes on variables. `const onClick = vi.fn()` is clearer
  than `const mockOnClick = vi.fn()` — the reader already knows it's a test.
- Test data: prefer named fixtures/factories over inline literals, and
  reference fixture properties instead of duplicating their values.

## Anti-patterns

- **Abbreviations anywhere.** `usr`, `ctx`, `cfg`, `btn`. Either the full word is readable or the concept is wrong.
- **Single-letter names.**
- **Unpredictable grab-bag folders.** The anti-pattern is not the folder name (`utils/`, `helpers/`, `lib/` are fine); it's the *lack of predictable subdivision inside*. A `utils.ts` or top-level `misc/` that accumulates unrelated units is bad. A `lib/errors/`, `lib/permissions/`, `utils/renderNotification.ts` layout is good: every file has a predictable home based on what it does. Rule of thumb — if a newcomer can't guess where a given helper lives, the folder has become a grab-bag.
- **Hungarian notation.** `sName`, `bIsActive`, `iCount`. The type system carries type information.
- **Opposites asymmetry.** If one side is `open`, the other is `close` — not `dismiss` or `hide`. Pick an opposite pair and stick to it.
- **Inconsistent acronym casing.** `APIHandler` vs. `ApiHandler`. Pick a casing convention per codebase and apply it everywhere.
- **Time-coupled names.** `newCheckout`, `v2Parser`. Rename the old one and let repo history remember the transition.
- **Stuttering.** `PostPostRepository`, `UserUserService`. Fix the nesting or drop the duplicate segment.
- **Algorithm vocabulary for domain concepts.** Naming an intermediate value after the technique used to compute it rather than what it represents in the problem domain. `windowStart` / `windowEnd` are sliding-window algorithm terms; `pageRangeStart` / `pageRangeEnd` describe what the values actually are. The same mistake appears as `buffer` instead of `pendingMessages`, `queue` instead of `approvalRequests`, `stack` instead of `navigationHistory`. If the domain has a name for the concept, use it.

For TypeScript- and JavaScript-specific naming rules (generic type parameters, unused callback parameters), see [authoring-typescript](../authoring-typescript/SKILL.md).

## Renaming discipline

When you split a unit (see [splitting.md](splitting.md)), rename both
halves. A split that keeps the original name on one side implies the
other side is a subordinate helper — usually false. Give each half
its own, fully descriptive name.
