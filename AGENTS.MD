# ZenithHealth — agent instructions

## What this repo is
Healthcare management: Next.js UI (`client/`) + Express API (`server/`).
Not a pnpm workspace. No shared package. No Next Route Handlers for the domain API.
Run commands inside `client/` or `server/`, not the repo root.

## Read first
- Doc map: `docs/INDEX.md`
- Hybrid auth (cookies, env names, known mismatches): `docs/auth/hybrid-auth.md`
- Two-app map (mounted vs Prisma-only vs empty UI): `docs/architecture/overview.md`
- Mounted APIs: `server/src/app/routes/index.ts` (commented = not public)
- Schema: `server/prisma/schema/`
- Client gate: `client/src/proxy.ts` + `client/src/lib/authUtlils.ts` (filename is misspelled; do not rename)
- Backend as-built: `BACKEND_SYSTEM_DOCUMENTATION.md` (on-demand; verify against `routes/index.ts`)

Package-specific: `client/AGENTS.md`, `server/AGENTS.md`. Cursor rules in `.cursor/rules/` are committed.

## Commands
client: `pnpm dev` | `pnpm lint` | `pnpm build`
server: `pnpm dev` | `pnpm lint` | `pnpm build` | `pnpm generate` | `pnpm migrate`
Do not run server `pnpm test` (placeholder fails).
Package manager: pnpm. Do not add npm/yarn lockfiles.

## Architecture
Controllers call services; services use prisma from `server/src/app/lib/prisma.ts`.
Prisma Client output is `server/src/generated/prisma` — never edit it.
Client server actions (`_action.ts`) use `lib/axios/httpClient.ts` (Next cookies).
Do not use httpClient in client components; browser code uses fetch / TanStack Query.

## Critical conventions
- New server features: follow `server/src/app/modules/schedule/` and mount in `routes/index.ts`.
- New UI: match existing route groups; update `lib/navItems.ts` if nav should change.
- Validation: Zod. Forms: `@tanstack/react-form`. UI primitives: shadcn + `@base-ui/react`.
- Next 16: `proxy.ts`, not `middleware.ts`. Read `node_modules/next/dist/docs/` before new Next APIs.

## Source of truth
Env names: `server/src/app/config/env.ts`, `server/.env.example`, `client/.env.example`.
DB fields: prisma schema only.
API paths: route files, not README or `prd.md`.

## Never
- Do not add Google OAuth. Login/register `/auth/google` buttons are TODOs; there is no server provider.
- Refresh is `POST /api/v1/auth/refresh-token`. Client `auth.service.ts` currently calls `/auth/refresh` — that is a mismatch, not a second endpoint. Do not invent extra auth routes.
- Appointment and doctor-schedule HTTP exist in modules but are unmounted. Do not mount them or add booking UI unless the task says so.
- Do not invent Prisma columns. Do not edit old migrations or generated Prisma.
- Do not log tokens, cookies, OTP, or patient/health payloads. Do not commit `.env`.
- Do not ignore `.cursor` in git. Project rules must stay version-controlled.
- Do not add react-hook-form or next-safe-action; they are not in package.json.
- Empty or missing dashboard `page.tsx` files are stubs, not features.
- Do not “complete” appointment booking by only adding UI.

## Workflow
Inspect canonical module → smallest change → `pnpm lint` in the touched package → do not expand scope.
Update docs only if architecture, auth, env names, or the mounted-route set changed.
