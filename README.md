# Study

A private, single-user study dashboard built with Next.js. It keeps course topics in one JSON document and recommends five unfinished topics using fixed, understandable rules.

## Local setup

Copy `.env.example` to `.env.local` and set:

```dotenv
APP_PASSWORD=your-password
SESSION_SECRET=a-long-random-secret-at-least-32-characters
BLOB_READ_WRITE_TOKEN=
```

Then run:

```bash
npm install
npm run dev
```

Without a Blob token, local changes are saved to the ignored file `data/study-data.local.json`.

## Vercel setup

1. Create a private Vercel Blob store and connect it to the project.
2. Add `APP_PASSWORD` and `SESSION_SECRET` in the Vercel project settings.
3. Confirm the Blob integration created `BLOB_READ_WRITE_TOKEN`.
4. Deploy the project.

Every app route and mutation requires the signed session cookie. Blob credentials remain server-only.

## Checks

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```
