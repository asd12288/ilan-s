# Study Dashboard Foundation Design

## Goal

Build a calm, private study dashboard for one user. It should make the next study action obvious without becoming another system to maintain.

The initial app includes the six active courses, their exam dates, and the topic inventory extracted from the user's study documents.

## Product principles

- Show only information that helps choose or complete the next study action.
- Use one short page title and no subtitle by default.
- Avoid onboarding copy, motivational text, repeated explanations, and decorative metrics.
- Prefer spacing, hierarchy, and concise labels over prose.
- Keep empty states to one sentence and one action.
- Use tooltips only for genuinely unclear icons.
- Keep topic maintenance faster than studying the topic itself.

## Scope

### Included

- Password login for the entire app
- Focus-first dashboard
- Course list and course detail pages
- Searchable and filterable topic list
- Topic editing
- Four topic levels: Not started, Weak, Learning, Strong
- Normal and High exam importance
- Last-studied date and one short next action
- Six seeded courses, exam dates, and extracted topics
- Persistent JSON storage in Vercel Blob
- Logout and minimal settings
- Responsive and keyboard-accessible UI

### Excluded

- Registration, email login, password recovery, and multiple users
- Roles or sharing
- Supabase, an ORM, or a relational database
- AI-generated plans, chat, notifications, and gamification
- File uploads and document management
- Calendar synchronization after the initial seed
- Rich notes, nested tasks, and separate resource tracking

## Information architecture

- `/login`: the only public route
- `/`: focus-first dashboard
- `/courses`: all courses ordered by exam date
- `/courses/[courseId]`: course progress and its topics
- `/topics`: all topics with search and compact filters
- `/settings`: logout and minimal storage status

Navigation remains compact and horizontal on larger screens. Mobile uses a small menu or compact bottom navigation, selected during implementation based on browser fit.

## Main workflow

1. The user signs in with one password.
2. The dashboard displays three to five recommended topics.
3. The user opens a topic and updates its level, importance, last-studied date, or next action.
4. The change is validated on the server and saved to Vercel Blob.
5. The dashboard ranking updates from the saved data.

## Recommendation ranking

Recommendations use deterministic rules rather than an opaque score:

1. Exclude Strong topics by default.
2. Put Not started before Weak, then Learning.
3. Within a level, put High importance before Normal.
4. Within the same importance, put the nearest exam first.
5. Use topic name as the stable final tie-breaker.

The dashboard shows at most five recommendations. It does not manufacture deadlines or automatically change a topic's level.

## Data model

The Blob contains one versioned JSON document.

```ts
type StudyData = {
  schemaVersion: 1
  updatedAt: string
  courses: Course[]
  topics: Topic[]
}

type Course = {
  id: string
  name: string
  shortName: string
  examAt: string
  secondExamAt?: string
  position: number
}

type TopicLevel = "not-started" | "weak" | "learning" | "strong"

type Topic = {
  id: string
  courseId: string
  name: string
  level: TopicLevel
  importance: "normal" | "high"
  lastStudiedAt?: string
  nextAction?: string
  position: number
}
```

IDs are stable slugs. Dates are stored as ISO 8601 strings. The server validates the complete document before writes. Unknown schema versions fail safely instead of being silently rewritten.

## Storage

- Vercel Blob stores one private JSON document.
- Server-only code owns Blob reads and writes.
- If no Blob exists, the app reads the bundled seed and creates the first stored document after the first valid mutation.
- Writes replace the complete small document. This is acceptable for a single-user app and keeps the storage model understandable.
- Failed writes leave the last successful Blob untouched and return a visible error.
- Blob credentials are never exposed to Client Components.

## Authentication

- The password is supplied through the server-only `APP_PASSWORD` environment variable.
- A separate server-only secret signs an HTTP-only session cookie.
- Cookies use `Secure` in production, `SameSite=Lax`, a bounded lifetime, and explicit logout invalidation.
- All app routes and all mutation entry points require a valid session.
- Authentication comparisons avoid straightforward timing leaks.
- There is no user table because the app has exactly one owner.

## Rendering and state

- Next.js App Router with Server Components by default.
- Pages read current study data on the server.
- Small Client Components handle dialogs, filters, and interactive controls.
- Mutations use validated server actions.
- The UI disables duplicate submissions and shows compact pending, success, and error feedback.
- After a successful mutation, affected routes are revalidated so another device sees current data on its next request.

## Visual system

The approved direction is quiet academic:

- Warm-white background and white primary surfaces
- Restrained indigo accent
- Neutral borders and low-contrast shadows
- Generous spacing with low information density
- Clear typography without oversized dashboard numbers
- Semantic shadcn tokens rather than raw component colors
- No large sidebar, card wall, gradients, decorative illustrations, or unnecessary badges

The dashboard leads with `Study now`. Course progress is secondary. Each screen uses concise visible text and avoids default subtitles.

## Components

- App shell and compact navigation
- Login form
- Recommended-topic list
- Course progress row/card
- Topic table/list
- Compact level and importance filters
- Topic edit dialog
- Status badge
- Progress indicator
- Loading, error, and empty states

Existing shadcn components are preferred. Custom components provide domain behavior, not replacements for standard controls.

## Error handling

- Invalid login returns one neutral error message.
- Missing environment variables fail with a clear server configuration error.
- Invalid Blob data is never rendered as trusted state or overwritten automatically.
- Validation errors appear beside the relevant field.
- Storage failures preserve the current form state and allow retry.
- The app does not claim a save succeeded until the Blob write completes.

## Verification

- Unit tests cover schema validation, recommendation ordering, and authentication helpers.
- Integration tests cover protected routes and server mutations.
- Browser tests cover login, logout, unauthorized redirects, topic editing, persistence after reload, filters, mobile layout, and keyboard use.
- Required checks: lint, TypeScript, tests, and production build.
- Visual verification compares the implemented dashboard with the approved focus-first, quiet-academic design at desktop and mobile widths.

## AGENTS.md requirements

`AGENTS.md` will document:

- Product purpose and strict scope
- Next.js 16 documentation requirement
- Route and module boundaries
- Data schema and recommendation rules
- Authentication and Blob security constraints
- Server Component and Client Component boundaries
- shadcn composition and semantic-token conventions
- Minimal-copy visual rule
- Commands and verification gates
- Explicit non-goals to prevent future agents from overbuilding

## Success criteria

- A logged-out visitor cannot access any app data or mutation.
- The owner can sign in on multiple devices using the configured password.
- Topic changes persist through Vercel Blob and remain after reload or redeploy.
- The dashboard consistently recommends the most relevant unfinished topics.
- The complete core workflow works on desktop and mobile.
- Visible text stays concise and the interface does not feel crowded.
