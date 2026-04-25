---
name: clean-authoring
description: >-
  Applies clean-code authoring principles: strict separation of concerns,
  thin entry points, orchestration vs. presentation splits, side effects as
  dedicated units, early returns, and names that read as descriptive phrases.
  Language- and framework-agnostic. Use when writing or refactoring code,
  naming a module/function/class/component, deciding whether to split a
  unit, or reviewing code for clarity.
---

# Clean Authoring

Write code that's easy to read. Two disciplines carry most of the weight:
**separation of concerns** and **naming**. Every principle below flows from
one of those.

## Pre-flight checklist

Before finishing any new or refactored unit, verify:

- [ ] The unit has exactly one reason to change.
- [ ] The name reads as a descriptive phrase in plain English.
- [ ] The entry point (route, CLI, page, controller) delegates; it does not own logic.
- [ ] Orchestration (state, effects, I/O) is separated from presentation/output.
- [ ] Side effects are a named unit, not a reaction sprinkled after state changes.
- [ ] Exceptional paths exit via early returns; the happy path is unindented.
- [ ] Folder/file structure mirrors responsibility: one unit per folder, co-located tests.
- [ ] No abbreviations anywhere.
- [ ] No single-letter names anywhere, including generic type parameters.

If any box is unchecked, refactor before moving on.

## Core principles

### 1. One unit, one concern

A function, class, component, or module has a single reason to change. If a
unit branches on *context* — "which format?", "which user role?", "which
environment?" — split by context and give each branch its own name.

Branching-on-context smell:

```ts
function formatReport(data: Report, mode: 'summary' | 'detailed') {
  if (mode === 'detailed') return `${data.title}\n${data.body}\n${data.footer}`
  return `${data.title}\n${data.body}`
}
```

Split:

```ts
function formatSummaryReport(data: Report) {
  return `${data.title}\n${data.body}`
}

function formatDetailedReport(data: Report) {
  return `${data.title}\n${data.body}\n${data.footer}`
}
```

Two names beat one name with a `mode` parameter. Callers no longer
pattern-match on an argument to understand behavior.

### 2. Names are phrases

A name is a short English phrase describing what the thing is and where
it belongs.

- Pluralization carries meaning: `Post` (single) vs. `Posts` (list).
- Location prefixes clarify scope: `DetailPage*`, `ListPage*`, `Admin*`, `Internal*`.
- Role suffixes communicate shape: `*Setter`, `*Writer`, `*Publisher`,
  `*Content`, `*Body`, `*Form`, `*Repository`, `*Service`, `*Adapter`, `*Handler`.
- Handler pairs: `on<Event>` for external (callbacks/props), `handle<Event>`
  for the internal implementation.
- No abbreviations. No single-letter names — including generic type parameters.
  If a name becomes unwieldy, the unit is doing too much.

See [naming.md](naming.md) for the full catalogue.

### 3. Thin entry points

Route handlers, CLI entries, controllers, page files exist to wire, not
to own logic. They should be readable in one glance.

```ts
export async function POST(request: Request) {
  return handleCreatePost(request)
}
```

The unit one layer in owns parsing, validation, error handling, and
composition. The entry point owns boundaries and delegation.

### 4. Orchestration vs. presentation

Split state/effects/I/O from rendering or output formatting.

- **Orchestrator**: owns state, dispatches actions, handles errors, reads context.
- **Presenter**: receives data via arguments, owns output shape.

Applies across contexts:

- HTTP: request parsing + validation → business logic → response shaping.
- CLI: arg parsing + side-effect coordination → pure computation → output formatting.
- UI: data fetching + state → markup.
- Batch jobs: scheduling + I/O → pure transforms → artifact emission.

### 5. Side effects are first-class units

Model effects as part of the action pipeline, not as reactions to state
changes observed after the fact.

Reactive (avoid):

```ts
const result = await saveRecord(record)
lastSaveResult = result
queueMicrotask(() => {
  if (lastSaveResult.error) notify(lastSaveResult.error)
})
```

Composed (prefer):

```ts
function withNotifications<Action extends (...args: unknown[]) => unknown>(
  action: Action,
  { onError }: { onError: (error: unknown) => void },
): (...args: Parameters<Action>) => Promise<Awaited<ReturnType<Action>>> {
  return (async (...args: Parameters<Action>) => {
    try {
      return await action(...args)
    } catch (error) {
      onError(error)
      throw error
    }
  }) as Action
}

const saveWithNotifications = withNotifications(saveRecord, { onError: notify })
await saveWithNotifications(record)
```

The effect is declared at the call site, composed into the action, and
owns its own failure mode. When an effect needs external coordination
(e.g., "register this with a parent context"), give it its own unit —
a `*Setter`, `*Writer`, or `*Publisher` — whose sole job is the
mount/unmount or acquire/release lifecycle.

### 6. Early returns for exceptional paths

```ts
function describe(input: Input | null): string | null {
  if (!input) throw new InvalidInputError()
  if (!permitted(input)) return null
  return format(input)
}
```

The happy path stays unindented and at the bottom. Works the same in any
language with early exit (TypeScript, Go, Python, Rust, Ruby, …).

### 7. Structure mirrors responsibility

```
unitName/
├── unitName.ext
├── index.ext               # barrel / public surface
└── __tests__/
    └── unitName.test.ext
```

One unit per folder. Tests co-located. The barrel exposes the unit's
public surface. If a folder holds two things, they're either siblings
(split into two folders) or one is a private helper (keep it in the
same file).

## When to split — quick triggers

See [splitting.md](splitting.md) for the full decision tree.

- A `variant` / `kind` / `mode` parameter drives more than a trivial style change → split by variant.
- A function mixes I/O and pure logic → split into orchestrator + pure helper.
- A unit owns both state/effects and non-trivial output construction → container + presenter.
- A module exports both domain logic and framework bindings → `<domain>` + `<domain>.<framework>`.
- A unit test would need a conditional to cover two "shapes" of behavior → split.

## When *not* to split

Splitting has a cost. Don't split when:

- The two halves would always be consumed together with no separate reuse or test story.
- The split is purely syntactic (no semantic concern difference).
- The resulting pair would require so much argument plumbing that plumbing dominates.

Prefer a well-named single unit over a premature split. The trigger is a
real second concern, not a line count.

## Additional resources

- [splitting.md](splitting.md) — full decision tree with before/after examples.
- [naming.md](naming.md) — naming catalogue: pluralization, prefixes, suffixes, handler pairs, anti-patterns.
