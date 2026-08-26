# ZenithHealth server — agent instructions

Repo-wide rules live in `../AGENTS.md`. This file is server-only.

## What this package is
Express 5 + TypeScript ESM API. Prisma 7 + PostgreSQL. Better Auth is used via `auth.api.*` in services, not as a mounted HTTP handler.

## Read first
- Mounted routers: `src/app/routes/index.ts` (commented lines are **not** public APIs)
- App + webhook: `src/app.ts` (`/api/v1`, Stripe `POST /webhook` outside `/api/v1`)
- Canonical module: `src/app/modules/schedule/`
- Prisma client runtime: `src/app/lib/prisma.ts` + `prisma.config.ts`
- Schema SoT: `prisma/schema/`
- Env names: `src/app/config/env.ts` and `.env.example`
- Auth: `src/app/lib/auth.ts`, `src/app/middleware/checkAuth.ts`, `../docs/auth/hybrid-auth.md`
- As-built narrative (verify routes first): `../BACKEND_SYSTEM_DOCUMENTATION.md`
- Do not treat `prd.md` as a live API contract.

## Commands
From this folder: `pnpm dev` | `pnpm lint` | `pnpm build` | `pnpm generate` | `pnpm migrate`
Do not run `pnpm test` (placeholder exits 1). Prefer `pnpm migrate` over `pnpm push` for schema changes.

## Module pattern
Copy **schedule**: `*.route.ts` or `*.routes.ts` (do not mass-rename), `*.controller.ts`, `*.service.ts`, `*.validation.ts` (Zod), optional constant/utils/interface.

HTTP flow: router → optional `checkAuth(Role.*)` + `validateRequest` + multer → controller (`catchAsync` + `sendResponse`) → service → `prisma` / `auth.api.*` / Stripe / Cloudinary.

- Business logic stays in services. Do not query Prisma in controllers.
- Do not add a repository layer.
- New routes **must** be registered in `src/app/routes/index.ts` or they do not exist.
- Unmounted today: `appointment`, `doctorschedule`. Prisma-only (no HTTP module): Patient, Prescription, Review, MedicalReport, PatientHealthData.

## Auth
`checkAuth` requires a live Better Auth session cookie (`better-auth.session_token` row in Prisma) **and** a valid `accessToken` JWT, then checks roles twice. Do not weaken this.

Do not mount Better Auth `toNodeHandler` unless the task explicitly asks. Cookie and env names: see `../docs/auth/hybrid-auth.md`.

## Prisma 7
Use the adapter in `src/app/lib/prisma.ts`. Never `new PrismaClient()` without `@prisma/adapter-pg`.
Import the client from `src/generated/prisma` — never edit that directory. New schema changes: edit `prisma/schema/`, then `pnpm generate` and a **new** migration. Do not rewrite applied migration SQL.

## Payments
Stripe webhook is `POST /webhook` on the Express app (raw body). Do not copy `payment.route.ts`: `/create-payment-intent` currently points at `handleStripeWebhook` — that is a bug, not a pattern.

## Never
- Invent mounted APIs, Google OAuth, or extra refresh paths.
- Log tokens, cookies, OTP, or health fields.
- Standardize `*.route.ts` vs `*.routes.ts` in the same PR as a feature.
- Use Nest, tRPC, Redis, or queues unless requested.
