---
name: authoring-typescript
description: >-
  TypeScript-specific authoring principles: immutable array construction over
  mutation, declarative transforms over imperative loops, const by default,
  named generic type parameters, and precise types over escape hatches. Apply
  alongside clean-authoring. Use when writing or reviewing TypeScript or
  JavaScript code.
---

# Authoring TypeScript

TypeScript-specific principles that extend [clean-authoring](../clean-authoring/SKILL.md).
Where clean-authoring is language-agnostic, this file covers TypeScript and
JavaScript idioms. Apply both together.

## Pre-flight checklist

- [ ] No array mutation — no `push`, `pop`, `splice`, `shift`, `unshift`, or direct index assignment.
- [ ] No imperative loops — no `for`, `for...of`, `for...in`, `while`, or `do-while`.
- [ ] `const` everywhere `let` would work. No `var`.
- [ ] No `any`. Use `unknown` for genuinely unknown types and narrow explicitly.
- [ ] No bare `as` assertion without a comment explaining why the type system cannot narrow it naturally.
- [ ] Generic type parameters are named words, not single letters (`Action` not `T`, `Item` not `I`, `Key` not `K`).
- [ ] Unused parameters in callbacks are named `_value`, not `_`.

If any box is unchecked, refactor before moving on.

## Core principles

### 1. Construct arrays and objects — don't mutate them

Build new values from old ones. Mutation hides the relationship between input
and output, makes functions harder to test in isolation, and causes subtle bugs
when the same reference is shared across callers.

Imperative (avoid):

```ts
const pages: (number | 'ellipsis')[] = [1]
if (hasLeadingGap) pages.push('ellipsis')

pages.push(...rangePages)
if (hasTrailingGap) pages.push('ellipsis')

if (lastPageMissing) pages.push(totalPages)

return pages
```

Declarative (prefer):

```ts
return [
  1,
  ...(hasLeadingGap ? ['ellipsis'] : []),
  ...rangePages,
  ...(hasTrailingGap ? ['ellipsis'] : []),
  ...(lastPageMissing ? [totalPages] : []),
]
```

The second form makes the output shape visible in one read. Every slot is
present in the literal; conditions are local to the element they affect.

**Immutable collection methods** — these return new values without mutating:

| Purpose                   | Method                             |
| ------------------------- | ---------------------------------- |
| Transform each element    | `Array.from`, `.map`               |
| Remove elements           | `.filter`                          |
| Flatten one level         | `.flatMap`                         |
| Accumulate into one value | `.reduce`                          |
| Combine two arrays        | spread `[...a, ...b]` or `.concat` |
| Find one element          | `.find`, `.findIndex`              |
| Test membership           | `.some`, `.every`, `.includes`     |
| Sort without mutating     | `[...arr].sort(...)`               |

**Disallowed** — these mutate in place: `push`, `pop`, `shift`, `unshift`,
`splice`, `sort` on the original, `reverse` on the original, and direct index
assignment `arr[index] = value`.

### 2. Declarative transforms over imperative loops

`for`, `while`, and `do-while` loops are imperative — they describe _how_ to
iterate. Array methods describe _what_ to produce. Prefer the latter.

This principle was reinforced during the implementation of a paginated page
list. A `for` loop accumulated pages into a mutable array; replacing it with
`Array.from` and spread made the intent legible without tracing a counter
variable:

```ts
// Before — imperative, mutable
const pageRange: number[] = []
for (let index = pageRangeStart; index <= pageRangeEnd; index++) {
  const page = index + 1
  if (page !== 1) pageRange.push(page)
}

// After — declarative, immutable
const pageRange = Array.from(
  Array(pageRangeEnd - pageRangeStart + 1),
  (_, index) => pageRangeStart + index + 1,
).filter((page) => page !== 1)
```

`Array.from(arrayLike, mapFunction)` is the right tool when you need a sequence
of a known length with each element derived from its position. The unused first
argument to the map function is named `_`, not `_value`, because it is unneeded.
The single-letter name rule from clean-authoring only applies to parameters that
are actually used.

### 3. `const` by default

Declare every binding with `const` unless reassignment is genuinely required.
When `let` appears, it signals intentional mutation — a reader should be able
to trust that signal. If `let` is used but the variable is never reassigned,
the signal is noise.

Never use `var`. It has function scope, hoists in surprising ways, and has no
advantage over `const` or `let` in modern TypeScript.

### 4. Precise types over escape hatches

TypeScript's type system is the first line of documentation. Weakening it
forces every caller to re-derive what the types would have told them.

- **`any`** — removes type checking entirely. Replace with `unknown` and
  narrow explicitly, or add the correct type.
- **`as` assertions** — tell the compiler to trust you instead of proving it.
  Acceptable only when interoperating with untyped external data or working
  around a known TypeScript limitation. Add a comment explaining why narrowing
  cannot be used instead.
- **Single-letter generic type parameters** — `T`, `K`, `V` carry no meaning.
  Use `Action`, `Key`, `Value`, `Item`, `Result`. If the name becomes
  unwieldy, the generic is doing too much. This is the TypeScript-specific
  application of clean-authoring's no-single-letter-names rule.
