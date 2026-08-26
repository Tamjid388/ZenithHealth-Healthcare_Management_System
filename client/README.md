# ZenithHealth client

Next.js 16 App Router UI for ZenithHealth. The domain API is the Express app in `../server/`, not Next Route Handlers.

Repo map: [`../AGENTS.md`](../AGENTS.md). Client agent notes: [`AGENTS.md`](AGENTS.md). Auth: [`../docs/auth/hybrid-auth.md`](../docs/auth/hybrid-auth.md).

## Setup

```bash
pnpm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL and JWT_ACCESS_SECRET (not ACCESS_TOKEN_SECRET)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Scripts: `pnpm dev` | `pnpm lint` | `pnpm build` | `pnpm start`. Package manager is **pnpm** only.

## Layout

- Public + auth: `src/app/(commonLayout)/`
- Dashboards: `src/app/(dashboardLayout)/` — patient, admin, doctor groups; shared `/my-profile`, `/change-password`
- Request gate: `src/proxy.ts` (Next.js 16; not `middleware.ts`)
- Server-only HTTP: `src/lib/axios/httpClient.ts`
- Forms: `@tanstack/react-form` + `src/zod`
- UI: `src/components/ui` (shadcn / `@base-ui/react`)

Many dashboard `page.tsx` files are stubs. Nav: `src/lib/navItems.ts`.

Env template: [`.env.example`](.env.example).
