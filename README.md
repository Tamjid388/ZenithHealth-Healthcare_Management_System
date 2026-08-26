# ZenithHealth

Healthcare management system: **Next.js 16** UI in `client/` and **Express 5 + Prisma 7 + PostgreSQL** API in `server/`. Not a pnpm workspace. There is no root `package.json`.

Agent instructions: [`AGENTS.md`](AGENTS.md). Doc map: [`docs/INDEX.md`](docs/INDEX.md).

## Requirements

- Node.js 22+ and [pnpm](https://pnpm.io/)
- PostgreSQL
- Stripe CLI only if you need local webhooks

## Setup

1. Clone the repo.
2. Copy env templates (names only; fill locally, never commit `.env`):
   - `client/.env.example` → `client/.env.local` (or `.env`)
   - `server/.env.example` → `server/.env`
3. Install and migrate the API, then run both apps:

```bash
cd server
pnpm install
pnpm generate
pnpm migrate
pnpm dev
```

```bash
cd client
pnpm install
pnpm dev
```

Default ports: client `3000`, server `5000` (`PORT` in server env). `FRONTEND_URL` on the server should match the Next origin (CORS).

Local Stripe webhook forward (server): `pnpm stripe:webhook` → `localhost:5000/webhook`.

## Packages

| Path | Role |
|------|------|
| `client/` | App Router UI, `src/proxy.ts` authz gate, server actions |
| `server/` | REST `/api/v1`, Stripe webhook, Prisma |

Dockerfiles in each package are **dev-oriented**, not production images.

## License

See each package if a license file is present.
