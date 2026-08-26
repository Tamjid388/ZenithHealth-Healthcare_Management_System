# ZenithHealth server

Express 5 + TypeScript (ESM) API. Prisma 7 + PostgreSQL. Better Auth is used from services (`auth.api.*`), not as a mounted HTTP handler.

Repo map: [`../AGENTS.md`](../AGENTS.md). Server agent notes: [`AGENTS.md`](AGENTS.md). Env names: [`src/app/config/env.ts`](src/app/config/env.ts).

## Setup

```bash
pnpm install
cp .env.example .env
pnpm generate
pnpm migrate
pnpm dev
```

API: `http://localhost:5000/api/v1`. Health-style root: `GET /`. Stripe webhook: `POST /webhook`.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | `tsx watch src/server.ts` |
| `pnpm build` | `tsc` |
| `pnpm start` | `node dist/server.js` (after build) |
| `pnpm lint` | ESLint |
| `pnpm generate` | Prisma Client |
| `pnpm migrate` | `prisma migrate dev` |
| `pnpm studio` | Prisma Studio |
| `pnpm stripe:webhook` | Forward to `localhost:5000/webhook` |
| `pnpm test` | Placeholder — **exits 1**. Do not run as a check. |

Mounted routes: [`src/app/routes/index.ts`](src/app/routes/index.ts). Dockerfile runs the **dev** server, not a production image.
