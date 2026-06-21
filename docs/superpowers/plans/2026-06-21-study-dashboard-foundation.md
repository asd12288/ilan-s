# Study Dashboard Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, calm study dashboard with six seeded courses, persistent Vercel Blob JSON data, deterministic study recommendations, and concise topic editing.

**Architecture:** Next.js 16 App Router renders protected Server Component pages. A signed HTTP-only cookie protects every page and every Server Action. A repository boundary reads and conditionally replaces one versioned JSON document in private Vercel Blob, with a filesystem adapter for local development.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix Rhea), Zod, jose, `@vercel/blob`, Vitest, Testing Library.

---

## File map

### Project guidance and configuration

- Modify `AGENTS.md` — durable instructions for future agents.
- Modify `.gitignore` — ignore local study state and brainstorming artifacts.
- Create `.env.example` — required environment names without secrets.
- Modify `package.json` and `package-lock.json` — runtime and test dependencies/scripts.
- Create `vitest.config.mts` — unit-test configuration.
- Create `vitest.setup.ts` — DOM matcher setup.

### Domain and persistence

- Create `features/study/model.ts` — Zod schemas and inferred types.
- Create `features/study/recommendations.ts` — deterministic ranking and progress helpers.
- Create `features/study/recommendations.test.ts` — ranking tests.
- Create `features/study/model.test.ts` — schema tests.
- Create `features/study/repository/types.ts` — storage contract and conflict error.
- Create `features/study/repository/blob.ts` — private Blob adapter.
- Create `features/study/repository/local-file.ts` — local JSON adapter.
- Create `features/study/repository/index.ts` — environment-based adapter selection and mutation orchestration.
- Create `features/study/repository/repository.test.ts` — repository orchestration tests with a fake adapter.
- Create `data/study-data.seed.json` — bundled initial data.

### Authentication

- Create `features/auth/token.ts` — edge-safe cookie name plus JWT signing and verification.
- Create `features/auth/session.ts` — cookie operations and authoritative session checks.
- Create `features/auth/password.ts` — constant-time password comparison.
- Create `features/auth/actions.ts` — login and logout Server Actions.
- Create `features/auth/auth.test.ts` — token and password tests.
- Create `proxy.ts` — optimistic redirect for unauthenticated requests.

### Shared application UI

- Modify `app/layout.tsx` — metadata, font cleanup, and global toaster.
- Modify `app/globals.css` — approved quiet-academic semantic tokens.
- Create `app/(protected)/layout.tsx` — authoritative session check and app shell.
- Create `components/app-shell.tsx` — compact navigation and logout.
- Create `components/page-header.tsx` — one concise title.
- Add shadcn components under `components/ui/` through the CLI.

### Login

- Create `app/login/page.tsx` — public login page.
- Create `features/auth/login-form.tsx` — concise `useActionState` form.

### Dashboard, courses, and topics

- Replace `app/page.tsx` by moving the dashboard to `app/(protected)/page.tsx`.
- Create `features/study/recommended-topics.tsx` — focused topic list.
- Create `features/study/course-progress.tsx` — compact course progress.
- Create `app/(protected)/courses/page.tsx` — course index.
- Create `app/(protected)/courses/[courseId]/page.tsx` — course detail.
- Create `app/(protected)/topics/page.tsx` — topic index.
- Create `features/study/topic-list.tsx` — client-side search/filter list.
- Create `features/study/status-badge.tsx` — consistent level labels.
- Create `features/study/topic-editor.tsx` — accessible edit dialog.
- Create `features/study/actions.ts` — authenticated topic mutation.
- Create `features/study/actions.test.ts` — mutation input tests around the pure update helper.
- Create `app/(protected)/settings/page.tsx` — minimal storage state and logout.
- Create `app/error.tsx` — concise recoverable error screen.
- Create `app/loading.tsx` — restrained skeleton state.

---

### Task 1: Lock project rules and install the minimal toolchain

**Files:**
- Modify: `AGENTS.md`
- Modify: `.gitignore`
- Create: `.env.example`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.mts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Expand `AGENTS.md` without removing the existing Next.js rule block**

Add sections with these exact constraints:

```md
## Product

This is a single-user study dashboard. Its purpose is to answer “what should I study next?” with the least possible UI and maintenance.

## Non-negotiable product rules

- Keep visible copy short. One page title; no subtitle unless the screen is ambiguous without it.
- Do not add onboarding, motivational copy, decorative metrics, gamification, AI chat, notifications, rich notes, or file management.
- Four topic levels only: not-started, weak, learning, strong.
- Recommendation order is deterministic: unfinished level, importance, nearest exam, topic name.
- Never change a topic level automatically.

## Architecture

- Next.js 16 App Router; consult `node_modules/next/dist/docs/` before using framework APIs.
- Server Components by default. Client Components are limited to interactive forms, dialogs, and local filtering.
- Every protected page and every mutation performs an authorization check.
- Production persistence is one private Vercel Blob JSON document.
- Storage code stays behind `features/study/repository/`; UI must not import `@vercel/blob`.
- Validate the full JSON document and all mutation input with Zod.
- Use conditional Blob writes so one device cannot silently overwrite a newer update from another device.

## UI

- Use installed shadcn components before custom controls.
- Use semantic Tailwind tokens, `gap-*`, `size-*`, and `cn()`; do not add raw status colors to feature components.
- Forms use shadcn Field composition. Dialogs always have an accessible title.
- Preserve the quiet-academic direction: warm white, restrained indigo, neutral borders, low density, no large sidebar.

## Verification

Before claiming completion run: `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build`. Browser-check login, logout, unauthorized redirects, topic persistence, desktop, and mobile.
```

- [ ] **Step 2: Ignore local-only state and visual-companion artifacts**

Append:

```gitignore
.superpowers/
data/study-data.local.json
```

- [ ] **Step 3: Install runtime and test dependencies**

Run:

```bash
npm install @vercel/blob@latest jose zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths
```

Expected: `package.json` and `package-lock.json` update successfully.

- [ ] **Step 4: Add repeatable scripts**

Set the scripts to include:

```json
{
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.mts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Document environment variables**

Create `.env.example`:

```dotenv
APP_PASSWORD=
SESSION_SECRET=
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 7: Verify the baseline and commit**

Run:

```bash
npm run lint
npm run typecheck
npm run test:run
```

Expected: lint/typecheck pass; Vitest reports no tests yet without configuration errors.

Commit only Task 1 files:

```bash
git add AGENTS.md .gitignore .env.example package.json package-lock.json vitest.config.mts vitest.setup.ts
git commit -m "chore: establish study app guardrails"
```

### Task 2: Define and test the study domain

**Files:**
- Create: `features/study/model.ts`
- Create: `features/study/model.test.ts`
- Create: `features/study/recommendations.ts`
- Create: `features/study/recommendations.test.ts`
- Create: `data/study-data.seed.json`

- [ ] **Step 1: Write failing schema tests**

Create `features/study/model.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { studyDataSchema } from "./model";

describe("studyDataSchema", () => {
  it("accepts the version-one document", () => {
    expect(studyDataSchema.parse({
      schemaVersion: 1,
      updatedAt: "2026-06-21T00:00:00.000Z",
      courses: [{ id: "logic", name: "Mathematical Logic", shortName: "Logic", examAt: "2026-07-10T09:00:00+03:00", position: 1 }],
      topics: [{ id: "logic-truth-tables", courseId: "logic", name: "Truth tables", level: "weak", importance: "normal", position: 1 }],
    }).schemaVersion).toBe(1);
  });

  it("rejects unknown levels", () => {
    const result = studyDataSchema.safeParse({ schemaVersion: 1, updatedAt: "bad", courses: [], topics: [{ level: "medium" }] });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the schema test and confirm failure**

Run: `npm run test:run -- features/study/model.test.ts`

Expected: FAIL because `./model` does not exist.

- [ ] **Step 3: Implement the versioned schema**

Create `features/study/model.ts` with these exports:

```ts
import { z } from "zod";

export const topicLevelSchema = z.enum(["not-started", "weak", "learning", "strong"]);
export const importanceSchema = z.enum(["normal", "high"]);
export const courseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  examAt: z.iso.datetime({ offset: true }),
  secondExamAt: z.iso.datetime({ offset: true }).optional(),
  position: z.number().int().nonnegative(),
});
export const topicSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  name: z.string().min(1),
  level: topicLevelSchema,
  importance: importanceSchema,
  lastStudiedAt: z.iso.datetime({ offset: true }).optional(),
  nextAction: z.string().trim().max(120).optional(),
  position: z.number().int().nonnegative(),
});
export const studyDataSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.iso.datetime({ offset: true }),
  courses: z.array(courseSchema),
  topics: z.array(topicSchema),
}).superRefine((data, context) => {
  const courseIds = new Set(data.courses.map((course) => course.id));
  for (const topic of data.topics) {
    if (!courseIds.has(topic.courseId)) context.addIssue({ code: "custom", path: ["topics"], message: `Unknown course ${topic.courseId}` });
  }
});

export type StudyData = z.infer<typeof studyDataSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type TopicLevel = z.infer<typeof topicLevelSchema>;
```

- [ ] **Step 4: Write failing recommendation tests**

Create `features/study/recommendations.test.ts` covering:

```ts
import { describe, expect, it } from "vitest";
import { rankTopics } from "./recommendations";

it("ranks unfinished level, importance, then exam date", () => {
  const result = rankTopics(seedData, new Date("2026-06-21T00:00:00+03:00"));
  expect(result.map((topic) => topic.id)).toEqual([
    "a-not-started-high",
    "a-not-started-normal",
    "b-weak-high",
    "a-learning-high",
  ]);
});

it("excludes strong topics and returns at most five", () => {
  expect(rankTopics(seedData, new Date()).every((topic) => topic.level !== "strong")).toBe(true);
  expect(rankTopics(seedData, new Date())).toHaveLength(4);
});
```

Define `seedData` in the test with two courses and five topics so each ordering rule is isolated.

- [ ] **Step 5: Implement ranking and progress helpers**

Create `features/study/recommendations.ts`:

```ts
import type { StudyData, Topic, TopicLevel } from "./model";

const levelRank: Record<TopicLevel, number> = { "not-started": 0, weak: 1, learning: 2, strong: 3 };

export function rankTopics(data: StudyData, _now: Date): Topic[] {
  const examByCourse = new Map(data.courses.map((course) => [course.id, Date.parse(course.examAt)]));
  return data.topics
    .filter((topic) => topic.level !== "strong")
    .toSorted((a, b) =>
      levelRank[a.level] - levelRank[b.level] ||
      Number(b.importance === "high") - Number(a.importance === "high") ||
      (examByCourse.get(a.courseId) ?? Infinity) - (examByCourse.get(b.courseId) ?? Infinity) ||
      a.name.localeCompare(b.name)
    )
    .slice(0, 5);
}

export function courseProgress(topics: Topic[]): number {
  if (topics.length === 0) return 0;
  const weights: Record<TopicLevel, number> = { "not-started": 0, weak: 1, learning: 2, strong: 3 };
  return Math.round((topics.reduce((sum, topic) => sum + weights[topic.level], 0) / (topics.length * 3)) * 100);
}
```

- [ ] **Step 6: Create the complete seed document**

Create six courses with these first and second exam times:

- Low-Level Languages: `2026-07-05T14:00:00+03:00`, second `2026-07-28T14:00:00+03:00`
- Mathematical Logic: `2026-07-10T09:00:00+03:00`, second `2026-08-12T16:00:00+03:00`
- Discrete Mathematics: `2026-07-12T14:00:00+03:00`, second `2026-08-09T16:00:00+03:00`
- Programming 2: `2026-07-14T09:00:00+03:00`, second `2026-08-19T16:00:00+03:00`
- Linear Algebra: `2026-07-17T09:00:00+03:00`, second `2026-08-25T16:00:00+03:00`
- Probability and Statistics: `2026-07-21T09:00:00+03:00`, second `2026-08-14T09:00:00+03:00`

Seed each topic with `level: "not-started"`, `importance: "normal"`, and a stable course-prefixed slug. Include the exact deduplicated inventory from the approved design conversation:

- Low-Level Languages: environment setup; CPU organization; memory and registers; machine code; assembler and loader; memory maps; program structure; labels/opcodes/operands; assembler directives; memory instructions; register instructions; conditional skips; input/output; interrupts; branches; loops; subroutines; algorithm translation; simulator debugging; readable assembly.
- Mathematical Logic: propositions; connectives; precedence; truth tables; equivalences; tautologies/contradictions/satisfiability; sentence translation; first-order logic; predicates; quantifiers; quantified negation; necessary/sufficient conditions; direct proof; contraposition; contradiction; counterexamples; CNF; DNF; semantic tableaux; literals/clauses; resolution; interpretations/models; logical consequence; propositional inference; knowledge bases; substitution; unification; first-order inference; structural induction; recursive definitions; propositional syntax; construction trees; recursive functions.
- Discrete Mathematics: sets; set equality; set operations; set proofs; relation properties; functions; composition; injective/surjective/bijective functions; infinite sets; cardinality; countability; induction; inductive structures; structural induction; recursive functions; recurrence relations; counting rules; permutations/selections; repetition; identical-object distribution; binomial coefficients; Newton binomial; combinatorial identities; inclusion-exclusion; proofs/counterexamples.
- Programming 2: C program structure; compilation; header/implementation files; modular programming; structures; structure pointers; pointers; pointer arithmetic; dynamic allocation; malloc/calloc/realloc/free; memory ownership; text files; streams; opening/closing files; formatted I/O; file errors; linked-list nodes; traversal/search; insertion; deletion; freeing lists; empty-list handling; ADTs; encapsulation; interface/implementation; function pointers; record/file databases.
- Linear Algebra: linear equations; systems; geometry of systems; Gaussian elimination; reduced row-echelon form; solution cases; free variables; solution spaces; matrix operations; transpose; inverse; elementary matrices; LU factorization; determinants; Laplace expansion; determinant properties; determinant applications; vector spaces; subspaces; linear combinations/span; independence/dependence; basis; dimension; coordinates; change of basis; linear transformations; kernel; image; transformation matrices; similar matrices; eigenvalues; eigenvectors; eigenspaces; algebraic/geometric multiplicity; diagonalization; matrix powers; complex numbers; polar form; complex powers/roots.
- Probability and Statistics: variable types/scales; frequency tables; mode/median/mean; variance/standard deviation; range/IQR; linear transformations; correlation; regression; probability basics; combinatorics; conditional probability; probability functions; discrete uniform; binomial; geometric; hypergeometric; Poisson; exponential; normal; normal approximation; populations/samples/parameters; sampling distributions; central limit theorem; confidence interval for mean; confidence interval for proportion; confidence interval for difference of means; hypothesis testing; test for mean; test for proportion; test for difference of means; chi-square goodness of fit; chi-square independence.

- [ ] **Step 7: Run focused tests and commit**

Run: `npm run test:run -- features/study/model.test.ts features/study/recommendations.test.ts`

Expected: PASS.

```bash
git add features/study/model.ts features/study/model.test.ts features/study/recommendations.ts features/study/recommendations.test.ts data/study-data.seed.json
git commit -m "feat: define study data and recommendations"
```

### Task 3: Add private session authentication

**Files:**
- Create: `features/auth/token.ts`
- Create: `features/auth/session.ts`
- Create: `features/auth/password.ts`
- Create: `features/auth/actions.ts`
- Create: `features/auth/auth.test.ts`
- Create: `proxy.ts`

- [ ] **Step 1: Write failing auth tests**

Test that a created token verifies with the same secret, fails with another secret, expires, and that password comparison returns false for different-length values without throwing.

```ts
const token = await createSessionToken("secret-with-at-least-32-characters", 60);
await expect(verifySessionToken(token, "secret-with-at-least-32-characters")).resolves.toBe(true);
await expect(verifySessionToken(token, "different-secret-with-32-characters")).resolves.toBe(false);
expect(passwordsMatch("abc", "abcd")).toBe(false);
```

- [ ] **Step 2: Run tests and confirm missing-module failures**

Run: `npm run test:run -- features/auth/auth.test.ts`

- [ ] **Step 3: Implement edge-safe token primitives with `jose`**

`features/auth/token.ts` imports only `jose` and Web-standard APIs so Proxy can safely import it:

```ts
export const SESSION_COOKIE = "study_session";
export async function createSessionToken(secret: string, maxAgeSeconds = 60 * 60 * 24 * 30): Promise<string>;
export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean>;
```

Use `SignJWT` and `jwtVerify` with `HS256`, an issuer/audience fixed to `ilan-study-dashboard`, and `TextEncoder`.

- [ ] **Step 4: Implement cookie session operations**

`features/auth/session.ts` must export:

```ts
export async function requireSession(): Promise<void>;
export async function setSessionCookie(): Promise<void>;
export async function clearSessionCookie(): Promise<void>;
```

`requireSession()` reads `await cookies()` and verifies through `features/auth/token.ts`, then redirects to `/login` when invalid. Cookie options are `httpOnly`, `sameSite: "lax"`, `path: "/"`, `secure: process.env.NODE_ENV === "production"`, and 30-day `maxAge`.

- [ ] **Step 5: Implement constant-time password comparison**

Use `timingSafeEqual` on SHA-256 digests so different input lengths do not leak through early return:

```ts
import { createHash, timingSafeEqual } from "node:crypto";

export function passwordsMatch(actual: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(actual), digest(expected));
}
```

- [ ] **Step 6: Implement login/logout Server Actions**

`loginAction` validates a non-empty password, checks `APP_PASSWORD`, sets the cookie, and redirects to `/`. It returns only `{ error: "Invalid password" }` for invalid credentials. `logoutAction` clears the cookie and redirects to `/login`. Both reject missing secrets with a server configuration error.

- [ ] **Step 7: Add Next.js 16 `proxy.ts` as an optimistic check**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/features/auth/token";

export async function proxy(request: NextRequest) {
  const valid = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET ?? "");
  if (!valid) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"] };
```

Keep authoritative `requireSession()` checks in protected layouts and mutation actions; Proxy is not the only defense.

- [ ] **Step 8: Run tests and commit**

Run: `npm run test:run -- features/auth/auth.test.ts && npm run typecheck`

Expected: PASS.

```bash
git add features/auth proxy.ts
git commit -m "feat: protect app with password sessions"
```

### Task 4: Implement JSON repositories for Blob and local development

**Files:**
- Create: `features/study/repository/types.ts`
- Create: `features/study/repository/blob.ts`
- Create: `features/study/repository/local-file.ts`
- Create: `features/study/repository/index.ts`
- Create: `features/study/repository/repository.test.ts`

- [ ] **Step 1: Write failing repository orchestration tests**

Use an in-memory fake adapter to verify seed fallback, full-schema validation, successful update timestamps, and conflict propagation.

```ts
const result = await updateStudyDataWith(fakeAdapter, (data) => ({
  ...data,
  topics: data.topics.map((topic) => topic.id === "logic-truth-tables" ? { ...topic, level: "strong" } : topic),
}), now);
expect(result.data.topics[0].level).toBe("strong");
expect(fakeAdapter.write).toHaveBeenCalledWith(expect.any(Object), "etag-1");
```

- [ ] **Step 2: Define the adapter contract**

```ts
export type StoredStudyData = { data: StudyData; version?: string };
export interface StudyRepository {
  read(): Promise<StoredStudyData | null>;
  write(data: StudyData, expectedVersion?: string): Promise<StoredStudyData>;
}
export class StudyDataConflictError extends Error {}
```

- [ ] **Step 3: Implement private Blob reads and conditional writes**

Use pathname `study-data/v1.json`.

- Read with `get(pathname, { access: "private" })`; return `null` for missing content.
- Convert the returned stream to text and validate with `studyDataSchema.parse`.
- Write with `put(pathname, JSON.stringify(data, null, 2), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: Boolean(expectedVersion), ifMatch: expectedVersion })`.
- Convert `BlobPreconditionFailedError` to `StudyDataConflictError`.
- Return the new `etag` as `version`.

- [ ] **Step 4: Implement the local file adapter**

Read `data/study-data.local.json` when present and otherwise return `null`. Write through a temporary sibling file and `rename` it to avoid a partially written JSON file. Generate a version from the resulting JSON SHA-256 digest and reject mismatched expected versions.

- [ ] **Step 5: Implement orchestration and adapter selection**

```ts
export function getStudyRepository(): StudyRepository {
  if (process.env.BLOB_READ_WRITE_TOKEN) return createBlobStudyRepository();
  if (process.env.VERCEL) throw new Error("BLOB_READ_WRITE_TOKEN is required on Vercel");
  return createLocalFileStudyRepository();
}
```

`readStudyData()` returns stored data or the parsed bundled seed. `updateStudyData(updater)` reads the current version, applies the updater, sets `updatedAt`, validates the full document, and writes with the expected version.

- [ ] **Step 6: Run repository tests and commit**

Run: `npm run test:run -- features/study/repository/repository.test.ts`

Expected: PASS.

```bash
git add features/study/repository
git commit -m "feat: persist study data as json"
```

### Task 5: Add the approved shell and login experience

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `app/(protected)/layout.tsx`
- Create: `components/app-shell.tsx`
- Create: `components/page-header.tsx`
- Create: `app/login/page.tsx`
- Create: `features/auth/login-form.tsx`
- Add: shadcn UI components

- [ ] **Step 1: Read exact shadcn component docs before adding them**

Run:

```bash
npx shadcn@latest docs button field input dialog select badge progress dropdown-menu sonner skeleton
```

Open the returned official URLs and confirm Radix APIs.

- [ ] **Step 2: Add only required components**

Run:

```bash
npx shadcn@latest add field input dialog select badge progress dropdown-menu sonner skeleton
```

Review every added file for Radix composition, alias correctness, and icon imports.

- [ ] **Step 3: Apply the quiet-academic semantic theme**

Keep Tailwind/shadcn structure, but set light tokens to a warm white background, white cards, restrained indigo primary/ring, neutral borders, and low-contrast muted surfaces. Remove the unused dark theme block unless a dark-mode control is explicitly added later. Add only layout defaults such as `body` minimum height.

- [ ] **Step 4: Simplify root layout**

Use one Inter font instance, metadata title `Study`, description `Private study dashboard`, and `<Toaster richColors={false} />`. Remove unused Geist imports and duplicate font variables.

- [ ] **Step 5: Create protected layout and compact shell**

The protected layout calls `await requireSession()` before `readStudyData()`. The shell provides text links for `Study`, `Courses`, and `Topics`, plus a dropdown containing `Settings` and `Log out`. Avoid a sidebar and explanatory navigation copy.

- [ ] **Step 6: Implement the login page and form**

The page contains only the app name, password field, submit button, and one neutral error line. Use shadcn `FieldGroup`, `Field`, `FieldLabel`, `Input`, and `Button`. Use `useActionState(loginAction, undefined)` and disable the button while pending.

- [ ] **Step 7: Verify and commit**

Run: `npm run lint && npm run typecheck && npm run build`

Expected: PASS with `APP_PASSWORD` and `SESSION_SECRET` supplied for build only if runtime validation executes during build.

```bash
git add app components features/auth/login-form.tsx components/ui
git commit -m "feat: add calm authenticated app shell"
```

### Task 6: Build the focus-first dashboard

**Files:**
- Delete: `app/page.tsx`
- Create: `app/(protected)/page.tsx`
- Create: `features/study/recommended-topics.tsx`
- Create: `features/study/course-progress.tsx`
- Create: `features/study/status-badge.tsx`

- [ ] **Step 1: Build a server-rendered dashboard from current data**

The page reads the repository once, calls `rankTopics`, and renders:

```tsx
<PageHeader title="Study now" />
<RecommendedTopics topics={recommended} courses={data.courses} />
<section aria-labelledby="courses-heading">
  <h2 id="courses-heading">Courses</h2>
  <CourseProgress courses={data.courses} topics={data.topics} />
</section>
```

Do not add a subtitle, greeting, date banner, fake streak, total-hours metric, or motivational text.

- [ ] **Step 2: Implement compact recommended-topic rows**

Each row shows only topic name, course short name, level, and days to exam. Rows link to the course page with the topic ID as a query parameter for editing.

- [ ] **Step 3: Implement secondary course progress**

Show course name, first exam date, and one progress bar. Order by exam date. Avoid six large cards; use a compact responsive list.

- [ ] **Step 4: Verify visual density and commit**

Run: `npm run lint && npm run typecheck`

```bash
git add app/page.tsx 'app/(protected)/page.tsx' features/study/recommended-topics.tsx features/study/course-progress.tsx features/study/status-badge.tsx
git commit -m "feat: add focus-first study dashboard"
```

### Task 7: Add course and topic browsing

**Files:**
- Create: `app/(protected)/courses/page.tsx`
- Create: `app/(protected)/courses/[courseId]/page.tsx`
- Create: `app/(protected)/topics/page.tsx`
- Create: `features/study/topic-list.tsx`

- [ ] **Step 1: Implement the course index**

Render the same compact course progress component with links, ordered by exam date. Use only the `Courses` title.

- [ ] **Step 2: Implement course detail with awaited Next.js 16 params**

```ts
export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  // read, find course, call notFound(), render topics
}
```

Show course name, exam date, overall progress, and its topic list. Do not add course descriptions.

- [ ] **Step 3: Implement topic search and filters as local UI state**

The Server Component supplies all current topics and courses to `TopicList`. The Client Component provides:

- one search input;
- course select with `All courses`;
- level select with `All levels`;
- concise result list grouped by course only when no course filter is active.

Search is case-insensitive over topic and course names. No URL synchronization is required for version one.

- [ ] **Step 4: Verify routes and commit**

Run: `npm run lint && npm run typecheck && npm run build`

```bash
git add 'app/(protected)/courses' 'app/(protected)/topics' features/study/topic-list.tsx
git commit -m "feat: browse courses and topics"
```

### Task 8: Add authenticated topic editing and persistence

**Files:**
- Create: `features/study/actions.ts`
- Create: `features/study/actions.test.ts`
- Create: `features/study/topic-editor.tsx`
- Modify: `features/study/topic-list.tsx`
- Modify: `features/study/recommended-topics.tsx`

- [ ] **Step 1: Test the pure topic update helper first**

```ts
it("updates only the selected topic", () => {
  const result = applyTopicUpdate(seed, {
    topicId: "logic-truth-tables",
    level: "strong",
    importance: "high",
    nextAction: "Solve exam question 1",
  }, now);
  expect(result.topics.find((topic) => topic.id === "logic-truth-tables")).toMatchObject({ level: "strong", importance: "high" });
  expect(result.topics.find((topic) => topic.id !== "logic-truth-tables")).toEqual(seed.topics[1]);
});
```

Also test unknown topic IDs and next actions longer than 120 characters.

- [ ] **Step 2: Implement validated update input and pure update**

Export `topicUpdateSchema`, `applyTopicUpdate`, and a `TopicActionState` discriminated union. When a topic is updated, set `lastStudiedAt` to the supplied server time only when the level changed or the user explicitly marks it studied.

- [ ] **Step 3: Implement the Server Action**

`updateTopicAction(previousState, formData)` must:

1. call `requireSession()`;
2. parse `FormData` with `topicUpdateSchema`;
3. call `updateStudyData` with `applyTopicUpdate`;
4. catch `StudyDataConflictError` and return `Data changed elsewhere. Reload and try again.`;
5. call `revalidatePath("/")`, `revalidatePath("/topics")`, and the matching course path;
6. return `{ status: "success" }` only after the write completes.

- [ ] **Step 4: Build the topic editor dialog**

Use `DialogTitle` even though visible chrome remains concise. Fields are Level, Importance, and Next action. Use shadcn `SelectGroup`/`SelectItem`, `FieldGroup`/`Field`, and a standard input. Show one compact error or success state; close after successful save and call `router.refresh()`.

- [ ] **Step 5: Connect every topic row to the editor**

Use a row/button trigger with a clear accessible label such as `Edit Truth tables`. The recommendation list and course detail use the same editor component rather than separate mutation UIs.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm run test:run -- features/study/actions.test.ts
npm run lint
npm run typecheck
```

Expected: PASS.

```bash
git add features/study/actions.ts features/study/actions.test.ts features/study/topic-editor.tsx features/study/topic-list.tsx features/study/recommended-topics.tsx
git commit -m "feat: edit and persist topic progress"
```

### Task 9: Add restrained states, settings, and full verification

**Files:**
- Create: `app/(protected)/settings/page.tsx`
- Create: `app/error.tsx`
- Create: `app/loading.tsx`
- Modify: `README.md`

- [ ] **Step 1: Implement minimal settings**

Show only storage mode (`Vercel Blob` or `Local JSON`), last updated time, and Logout. Do not expose tokens, paths, or the configured password.

- [ ] **Step 2: Add concise loading and error states**

`app/loading.tsx` uses three skeleton rows. `app/error.tsx` is a Client Component with title `Couldn’t load study data` and one `Try again` button calling `reset()`.

- [ ] **Step 3: Document local and Vercel setup**

Update `README.md` with:

1. `cp .env.example .env.local`;
2. generate a 32+ character `SESSION_SECRET`;
3. set `APP_PASSWORD`;
4. local data writes to ignored `data/study-data.local.json`;
5. create and connect a **private** Vercel Blob store;
6. confirm `BLOB_READ_WRITE_TOKEN`, `APP_PASSWORD`, and `SESSION_SECRET` in Vercel;
7. run the verification commands.

- [ ] **Step 4: Run the complete automated gate**

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Expected: all pass with no warnings caused by app code.

- [ ] **Step 5: Run browser verification**

Start with explicit development secrets:

```bash
APP_PASSWORD='test-password' SESSION_SECRET='test-session-secret-at-least-32-characters' npm run dev
```

Verify:

- `/` redirects to `/login` when logged out;
- wrong password stays on login with one error line;
- correct password opens `Study now`;
- dashboard has no subtitle or unnecessary explanatory copy;
- changing one topic persists after reload;
- course and topic filters work;
- logout blocks protected pages;
- no horizontal overflow at 390×844;
- compact desktop layout is clean at 1440×900;
- keyboard tab order reaches navigation, topic rows, dialog fields, save, and close.

- [ ] **Step 6: Compare against the approved concept**

Capture desktop and mobile screenshots. Inspect the approved quiet-academic concept and current screenshots with `view_image`. Check at least: focus-first hierarchy, white/warm-white palette, restrained indigo, low text density, compact course list, and absence of oversized sidebar/cards.

- [ ] **Step 7: Commit final states and documentation**

```bash
git add 'app/(protected)/settings' app/error.tsx app/loading.tsx README.md
git commit -m "docs: finish study dashboard foundation"
```

### Task 10: Final repository audit

**Files:**
- Inspect all changed files

- [ ] **Step 1: Confirm no unrelated user changes were overwritten**

Run: `git status --short` and compare remaining changes to the initial setup state.

- [ ] **Step 2: Audit copy density**

Search visible copy and remove nonessential subtitles, helper paragraphs, greetings, motivational language, duplicate labels, and explanatory metrics.

- [ ] **Step 3: Audit security boundaries**

Confirm every Server Action calls `requireSession()`, Blob code is server-only, no secret is prefixed `NEXT_PUBLIC_`, production cannot fall back to filesystem persistence, and Proxy is not the sole authorization check.

- [ ] **Step 4: Run the final gate once more**

```bash
npm run lint && npm run typecheck && npm run test:run && npm run build
```

Expected: exit code 0.
