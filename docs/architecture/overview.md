# Architecture overview

ZenithHealth is **two packages**, not a pnpm workspace and not a Next.js full-stack API.

```text
Browser → Next.js (client/)  →  Express /api/v1 (server/)  →  PostgreSQL (Prisma)
                 proxy.ts              checkAuth
                 _action.ts            controllers → services
                 httpClient (server)   prisma / Better Auth API / Stripe / Cloudinary
```

- **Client:** Next.js 16 App Router in `client/`. Entry `src/app/layout.tsx`. Network gate `src/proxy.ts` (not `middleware.ts`).
- **Server:** Express 5 in `server/`. Process `src/server.ts`. App `src/app.ts`. Domain API prefix `/api/v1`. Stripe webhook `POST /webhook` on the Express app (not under `/api/v1`).
- No shared package. No repository layer. No queues, OpenAPI, or test harness.

Human runbooks: root `README.md`, `client/README.md`, `server/README.md`. Dockerfiles in each package run **dev** (`next dev`, `pnpm generate && pnpm dev`), not production builds.

## Mounted HTTP vs Prisma-only vs UI stubs

**Live API** is whatever is **uncommented** in `server/src/app/routes/index.ts`:

| Mount | Module |
|-------|--------|
| `/auth` | auth |
| `/speciality` | speciality |
| `/users` | user (doctor/admin provisioning) |
| `/doctors` | doctor |
| `/admin` | admin |
| `/schedule` | schedule |
| `/payment` | payment |

Commented (code exists, **not public**): `/appointments`, `/doctor-schedules`.

**Prisma models with no HTTP module:** Patient, Prescription, Review, MedicalReport, PatientHealthData (and related appointment/payment fields used from other services). Schema: `server/prisma/schema/`.

**Client dashboards:** route groups and `src/lib/navItems.ts` exist for patient, admin, and doctor. Many admin `page.tsx` files are stubs (heading only or empty). Doctor dashboard has layouts/`loading.tsx` and **no** `page.tsx` yet. Nav `href`s can disagree with folder names (typos, `specialties` vs `specialities`). Empty pages are not implemented features.

Do not add appointment booking UI unless the task also mounts and finishes the API. Do not invent Redis, Nest, tRPC, or Next Route Handlers for the domain API.

## Where to copy structure

| Task | Copy |
|------|------|
| New API domain | `server/src/app/modules/schedule/` then register in `routes/index.ts` |
| New mutation + form | `login/_action.ts` + `LoginForm.tsx` + `src/zod` |
| New dashboard page | matching `(dashboardLayout)` group, `authUtlils.ts`, `navItems.ts` only if it should show in the sidebar |
