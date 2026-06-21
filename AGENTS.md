<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Product

This is a single-user study dashboard. Its purpose is to answer “what should I study next?” with the least possible UI and maintenance.

## Non-negotiable product rules

- Keep visible copy short. Use one page title and no subtitle unless the screen is ambiguous without it.
- Do not add onboarding, motivational copy, decorative metrics, gamification, AI chat, notifications, rich notes, or file management.
- Use four topic levels only: `not-started`, `weak`, `learning`, and `strong`.
- Recommendation order is deterministic: unfinished level, importance, nearest exam, then topic name.
- Never change a topic level automatically.

## Architecture

- Use the Next.js 16 App Router. Consult `node_modules/next/dist/docs/` before using framework APIs.
- Prefer Server Components. Limit Client Components to interactive forms, dialogs, and local filtering.
- Perform an authorization check in every protected layout and every mutation.
- Production persistence is one private Vercel Blob JSON document.
- Keep storage behind `features/study/repository/`; UI code must not import `@vercel/blob`.
- Validate the complete JSON document and all mutation inputs with Zod.
- Use conditional Blob writes so one device cannot silently overwrite a newer update.

## UI

- Use installed shadcn components before creating custom controls.
- Use semantic Tailwind tokens, `gap-*`, `size-*`, and `cn()`.
- Forms use shadcn Field composition. Dialogs always have an accessible title.
- Preserve the quiet-academic direction: warm white, restrained indigo, neutral borders, low density, and no large sidebar.

## Verification

Before claiming completion, run `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build`. Browser-check login, logout, unauthorized redirects, topic persistence, desktop, and mobile layouts.
