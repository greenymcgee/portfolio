# Splitting: when and how

Splitting is the mechanical expression of separation of concerns. This
file covers the decision tree and worked before/after examples.

## Decision tree

Ask in order:

1. **Does this unit have more than one reason to change?**
   A "reason to change" is usually one of:
   - The format of a persisted record
   - The transport protocol (HTTP, queue, in-process call)
   - The UI / output shape
   - The authorization policy
   - A third-party API signature

   If the unit would be edited for two unrelated reasons, split.

2. **Does a parameter gate behavior rather than carry data?**
   A `mode`, `variant`, `kind`, `strategy`, or boolean flag that makes the
   function take fundamentally different paths is a concern-in-disguise.
   Split by that parameter.

3. **Does the unit mix I/O with pure computation?**
   Extract the pure computation into a named helper. Keep the I/O shell thin.

4. **Would a unit test need a conditional to cover two shapes?**
   If testing requires `if (case === 'a') expect(...) else expect(...)`, the
   unit has two concerns.

5. **Are orchestration and output tangled?**
   A single unit that fetches, manages state, and builds complex output
   owns two jobs. Split into container + presenter.

If any answer is yes, split.

## When *not* to split

- The halves will always be consumed together and have no separate reuse or test story.
- The split is purely syntactic (same concern, two files).
- The pair would require so much argument plumbing that plumbing becomes the dominant complexity.

## Worked example: split by variant

Before:

```ts
function renderNotice(notice: Notice, severity: 'info' | 'warning' | 'error') {
  const prefix =
    severity === 'error' ? '[!] ' : severity === 'warning' ? '[*] ' : ''
  const style =
    severity === 'error'
      ? styles.error
      : severity === 'warning'
        ? styles.warning
        : styles.info
  return { text: prefix + notice.text, style }
}
```

After:

```ts
function renderInfoNotice(notice: Notice) {
  return { text: notice.text, style: styles.info }
}

function renderWarningNotice(notice: Notice) {
  return { text: `[*] ${notice.text}`, style: styles.warning }
}

function renderErrorNotice(notice: Notice) {
  return { text: `[!] ${notice.text}`, style: styles.error }
}
```

Each name describes exactly what it produces. Callers are explicit about intent.

## Worked example: I/O vs. pure logic

Before:

```ts
async function exportReport(reportId: string): Promise<void> {
  const report = await db.reports.findById(reportId)
  const csv = [
    report.title,
    ...report.rows.map((row) => `${row.label}: ${row.value}`),
  ].join('\n')
  await fs.writeFile(`${reportId}.csv`, csv)
}
```

After:

```ts
function formatReportAsCsv(report: Report): string {
  return [
    report.title,
    ...report.rows.map((row) => `${row.label}: ${row.value}`),
  ].join('\n')
}

async function exportReport(reportId: string): Promise<void> {
  const report = await db.reports.findById(reportId)
  await fs.writeFile(`${reportId}.csv`, formatReportAsCsv(report))
}
```

`formatReportAsCsv` is pure, trivially testable, and reusable.
`exportReport` owns only the I/O choreography.

## Worked example: container + presenter

Before:

```ts
async function shipDailyDigest(userId: string): Promise<void> {
  const user = await db.users.findById(userId)
  const posts = await db.posts.findRecentForUser(userId)
  const body = `Hi ${user.name},\n\n${posts
    .map((post) => `- ${post.title}`)
    .join('\n')}`
  await mailer.send({ to: user.email, subject: 'Daily digest', body })
}
```

After:

```ts
function buildDigestEmail(user: User, posts: Post[]): Email {
  return {
    to: user.email,
    subject: 'Daily digest',
    body: `Hi ${user.name},\n\n${posts
      .map((post) => `- ${post.title}`)
      .join('\n')}`,
  }
}

async function shipDailyDigest(userId: string): Promise<void> {
  const user = await db.users.findById(userId)
  const posts = await db.posts.findRecentForUser(userId)
  await mailer.send(buildDigestEmail(user, posts))
}
```

`buildDigestEmail` is a pure presenter. `shipDailyDigest` is a thin
orchestrator. Each has exactly one reason to change.

## Worked example: a parameter that's really two concepts

Before:

```ts
function fetchPosts(options: { includeDrafts: boolean; authorId?: string }) {
  /* … */
}
```

Two concerns hidden inside `options`: a visibility filter and an author
filter. Either split into purpose-specific functions:

```ts
function fetchPublishedPosts() {
  /* … */
}
function fetchAllPostsIncludingDrafts() {
  /* … */
}
function fetchPostsByAuthor(authorId: string) {
  /* … */
}
```

…or, when the combinatorics are real, promote the concern to a tagged union:

```ts
type PostQuery =
  | { kind: 'published' }
  | { kind: 'all' }
  | { kind: 'byAuthor'; authorId: string }

function fetchPosts(query: PostQuery) {
  /* … */
}
```

The tagged union makes the concerns explicit instead of bundling them
into loose options.
