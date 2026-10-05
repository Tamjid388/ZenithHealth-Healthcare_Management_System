# ZenithHealth — Product Requirements Document (PRD)

> **Product-level PRD (client + server).** For backend internals, see `docs/BACKEND_SYSTEM_DOCUMENTATION.md` (on-demand only).
> **Before treating any API path as public,** verify `server/src/app/routes/index.ts` — commented mounts are not APIs.
> **Source of truth:** code under `client/` and `server/`; DB fields under `server/prisma/schema/`; env names under `server/src/app/config/env.ts`, `server/.env.example`, `client/.env.example`.
> This PRD describes intent + current status as of 2026-10-05. It is not a live OpenAPI contract. `server/prd.md` is superseded for product decisions.

| Field | Value |
|-------|-------|
| Status | Draft — reflects as-built + planned scope |
| Date | 2026-10-05 |
| Owners | Product / Engineering (unassigned) |
| Stakeholders | Patients, Doctors, Admins, Super Admins |
| Packages | `client/` (Next.js 16) + `server/` (Express 5 + Prisma 7 + PostgreSQL) |
| API base | `/api/v1` (server) + `POST /webhook` (Stripe, outside `/api/v1`) |
| Related | `docs/INDEX.md`, `docs/architecture/overview.md`, `docs/auth/hybrid-auth.md`, `AGENTS.md`, `client/AGENTS.md`, `server/AGENTS.md` |

---

## 1. Overview — what does this system do? (plain language)

ZenithHealth is a **hospital/clinic management web app** that connects **patients** with **doctors** and gives **admins** tools to run the operation.

In simple terms, the system serves these features:

1. **Accounts and login** — Patients can register, log in, verify email with OTP, reset a forgotten password, change password, and log out. Doctors and admins get their accounts created by staff (patients self-register).
2. **Find a doctor** — Any visitor can browse the doctor directory, filter by speciality, and open a doctor's public profile (consultation pages).
3. **Book appointments (planned, not live yet)** — Patients should be able to pick a time slot, book a visit, see "my appointments," and join via a video-calling ID. The data model exists, but the booking API (`/appointments`) is **commented out in `routes/index.ts`** and must not be treated as live.
4. **Doctor time slots (schedules)** — Admins create 30-minute time slots for a date range. Doctors link those slots to themselves ("my schedules") and mark availability. Admins can view all doctor-schedule links.
5. **Doctor specialities** — Admins manage medical specialities (e.g. Cardiology) with title, description, and icon image. Patients browse doctors by speciality.
6. **Staff management** — Super Admins create admin accounts; the system lists, updates, and soft-deletes admins, doctors, and patient profiles. Doctors update their own professional profile (fee, qualifications).
7. **Payments** — Patients pay for appointments via Stripe. The real Stripe webhook is `POST /webhook`. The `POST /api/v1/payment/create-payment-intent` route currently points at the webhook handler (known bug — not a pattern to copy).
8. **Prescriptions** — Doctors should issue prescriptions tied to an appointment; patients should see "my prescriptions." Schema exists; dedicated HTTP endpoints do not.
9. **Reviews and ratings** — Patients should rate doctors after visits; doctors see "my reviews." Schema exists; dedicated HTTP endpoints do not.
10. **Health records** — Patients should keep medical reports and health data (blood group, history). Schema exists (`MedicalReport`, `PatientHealthData`); dedicated HTTP endpoints do not.
11. **Dashboards and stats** — Role-based dashboards (patient / doctor / admin) plus an admin stats endpoint (`GET /api/v1/stats`). Many dashboard `page.tsx` files are still stubs — an empty page is not a feature.
12. **Public information pages** — Home, consultation, diagnostics, medicines, health-plans, NGOs, plus auth pages (login/register/verify-email/forgot/reset).

Anyone reading only this section should understand: **who the app is for, what they can do, and what is still missing** (booking, prescriptions, reviews, and health-record APIs).

---

## 2. Goals and non-goals

### Goals

- Let patients discover doctors and (once finished) book and pay for visits end-to-end.
- Let doctors manage availability, appointments, prescriptions, and reviews.
- Let admins operate users, schedules, specialities, payments, and platform stats.
- Keep auth, roles, and audit behavior consistent across Next.js gate (`client/src/proxy.ts`) and Express gate (`checkAuth`).

### Non-goals (explicitly out of scope for this PRD)

- No Google OAuth. Login/register `/auth/google` buttons are TODOs; there is no server provider. Do not add OAuth unless tasked.
- No second refresh endpoint. Server refresh is `POST /api/v1/auth/refresh-token`. Client `services/auth.service.ts` calling `/auth/refresh` is a mismatch, not a second API.
- No Next Route Handlers for the domain API. Domain API is Express only.
- No Nest, tRPC, Redis/queues, OpenAPI/Swagger, or production Docker hardening in this cycle.
- No "complete booking with UI only" — appointment UI requires a mounted, finished booking API first.

---

## 3. Users and roles

| Role | Enum | What they do |
|------|------|--------------|
| Visitor (logged out) | — | Browse home, consultation/doctor directory, diagnostics, medicines, health-plans, NGOs; register/login |
| Patient | `PATIENT` | Book/manage appointments (planned), pay, view prescriptions and health records, review doctors, manage profile/password |
| Doctor | `DOCTOR` | Manage own schedule links, view appointments, write prescriptions, view own reviews, manage profile |
| Admin | `ADMIN` | Manage doctors, patients, schedules, specialities, appointments, payments; view stats |
| Super Admin | `SUPER_ADMIN` | All admin powers + create/update/delete admin accounts |

Roles live in `server/prisma/schema/enums.prisma`. Route ownership on the client lives in `client/src/lib/authUtlils.ts` (filename misspelled; do not rename). Sidebar entries live in `client/src/lib/navItems.ts`.

---

## 4. Scope and implementation status

Status key: **Live** = mounted + usable; **Partial** = code exists but gaps/bugs; **Planned** = schema and/or UI stub only; **Stub** = page file exists but heading-only/empty.

### 4.1 Live (verify in `server/src/app/routes/index.ts`)

- Auth: register, login, `GET /me`, refresh-token, change-password, logout, verify-email, forget/reset-password (`/auth`).
- User provisioning: `POST /users/create-doctor`, `POST /users/create-admin` (super-admin only for admin).
- Doctor directory: list/get/update/soft-delete (`/doctors`).
- Admin management: list/get/update/delete (`/admin`).
- Speciality CRUD with icon upload (`/speciality`).
- Schedule slot generation + CRUD (`/schedule`).
- Doctor-schedule links: doctor self-serve (`POST/GET/PATCH/DELETE /doctor-schedules/my`) + admin reads (`GET /doctor-schedules`).
- Admin stats: `GET /stats` (admin/super-admin).
- Stripe webhook: `POST /webhook` on the Express app (raw body).

### 4.2 Partial (use with caution)

- Payment intent: `POST /payment/create-payment-intent` is mounted but wired to `handleStripeWebhook` (bug). Do not copy.
- Doctor routes and `GET /admin/:id` lack `checkAuth` as mounted (effectively public). Speciality create has admin auth commented out.
- `checkAuth` requires **both** Better Auth session cookie and JWT `accessToken`; partial logout/misconfiguration confuses clients.

### 4.3 Planned / stubs (do not sell as done)

- Appointment booking API (`/appointments` commented out; service has `bookAppointment` + unfinished `getMyAppointments` stub).
- Prescription, Review, MedicalReport, PatientHealthData HTTP modules (Prisma models only).
- Many admin dashboard pages and doctor dashboard pages are stubs or loading-only. Empty `page.tsx` is not a feature.
- `server/prisma/seed.ts` demo data needs an existing patient + doctor; `pnpm test` is a placeholder that exits 1.

---

## 5. Functional requirements

### FR-1 Auth and session

- Patient self-registration creates Better Auth user + `Patient` row transactionally; issues `accessToken`, `refreshToken`, `better-auth.session_token` cookies.
- Login rejects blocked/deleted users; same cookies as registration.
- `GET /auth/me` returns full user with nested patient/doctor relations.
- Refresh uses `refreshToken` + session cookie; updates session expiry.
- Change-password via Better Auth; may clear `needPasswordChange`; re-issues JWT cookies.
- Logout via Better Auth; clears all three cookies.
- OTP verify-email, forget-password, reset-password via Better Auth + Nodemailer/EJS.
- Client gate: `client/src/proxy.ts` (JWT `JWT_ACCESS_SECRET`); server gate: `checkAuth` (session + `ACCESS_TOKEN_SECRET`). Names differ — do not conflate.

Acceptance: register → login → me → refresh → change-password → logout works with cookies; blocked user cannot log in; OTP flows send mail.

### FR-2 Doctor discovery (public)

- `GET /doctors` with search/filter/pagination/sort; excludes soft-deleted.
- `GET /doctors/:id` with specialities, appointments (where available), reviews.
- Client: `/consultation` list + `/consultation/doctor/[id]` profile (TanStack Query prefetch).
- `GET /doctors` stays public by decision (consultation page needs it).

### FR-3 Appointment booking (planned)

- Patient picks an unbooked doctor-schedule slot → creates `Appointment` (`SCHEDULED`, `UNPAID`) with `videoCallingId` → sets `DoctorSchedules.isBooked`.
- Patient: list/cancel own appointments. Doctor/admin: view by scope. Status transitions `SCHEDULED → INPROGRESS → COMPLETED / CANCELED`.
- Must fix before launch: mount routes, correct `uuidv7` import (currently from `"zod"`), finish `getMyAppointments`, return created row from transaction, add `isBooked` guard.

### FR-4 Schedules and doctor-schedules

- Admin creates slots from `startDate/endDate + startTime/endTime`, expanded to 30-minute `Schedule` rows, skipping duplicates.
- Doctor links/unlinks slots to self; admin views all links and single `doctorId/scheduleId` pairs.
- Canonical server pattern to copy for new modules: `server/src/app/modules/schedule/`.

### FR-5 Specialities

- Create with optional icon (`multipart`, field `file`, Cloudinary URL from `req.file.path`); Zod `title` + optional `description`.
- List/update/delete with role gates as mounted. Fix before launch: re-enable admin auth on create.

### FR-6 Staff and patient administration

- Super Admin creates admins; admin/super-admin list, update, soft-delete (clear sessions, block self-delete).
- Doctor profile update; soft-delete marks `isDeleted`.
- Patient profile is Prisma-managed; no dedicated patient CRUD HTTP module yet.

### FR-7 Payments

- Patient creates Stripe checkout intent for an appointment → `Payment` row (`UNPAID`) → Stripe webhook marks `PAID` and updates appointment `paymentStatus`.
- Success page: `/payment/success`. Fix before launch: split real intent endpoint from webhook handler.

### FR-8 Prescriptions, reviews, health records (planned)

- Prescription 1:1 per appointment (doctor → patient, with medicines/dosage).
- Review 1:1 per appointment (patient → doctor, rating + text; aggregates to doctor rating).
- `MedicalReport` 1:N per patient; `PatientHealthData` 1:1 per patient.
- Client stubs exist (`my-prescriptions`, `health-records`, `my-reviews`, `prescriptions-management`, `reviews-management`) — backend modules required before they are real.

### FR-9 Dashboards, stats, profile

- Patient: `/dashboard`, `my-appointments`, `book-appointments`, `my-prescriptions`, `health-records`.
- Doctor: `/doctor/dashboard`, `appointments`, `my-schedules`, `prescriptions`, `my-reviews`.
- Admin: `/admin/dashboard` + `admins/doctors/patients/appointments/schedules/specialties/doctor-schedules/doctor-specialties/payments/prescriptions/reviews-management`.
- Shared: `/my-profile`, `/change-password`, `/` home, dashboard landing.
- `GET /stats` for admin overview cards.

### FR-10 Public and auth pages

- `/`, `/consultation`, `/diagnostics`, `/medicines`, `/health-plans`, `/ngos`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`.

---

## 6. User journeys (happy path)

1. **Patient books care (target):** registers → verifies email → browses consultation → opens doctor → picks slot → books → pays via Stripe → sees appointment + prescription → leaves review.
2. **Doctor works:** account created → logs in → links schedule slots → sees appointments → writes prescriptions → reads reviews.
3. **Admin operates:** creates doctors/admins/specialities/schedules → monitors appointments/payments → checks stats → manages users.

Today journey 1 stops at "browses consultation" because booking/payment-intent APIs are not finished.

---

## 7. Non-functional requirements

- **Security:** hybrid session+JWT required on gated APIs; role checks twice; no token/cookie/OTP/health logging; no `.env` commits; file uploads via multer+Cloudinary with error cleanup.
- **Validation:** Zod via `validateRequest` (supports `body.data` JSON string for multipart).
- **Consistency:** `sendResponse` success shape `{ success, message, data?, meta? }`; `globalErroHandler` for Zod/AppError/500; `notFound` for unknown routes.
- **Data:** Prisma 7 + `@prisma/adapter-pg` on PostgreSQL; multi-file schema; generated client in `server/src/generated/prisma` (never hand-edit); new changes via new migrations only.
- **Config:** fail-fast env validation in `server/src/app/config/env.ts`; `FRONTEND_URL` must match Next origin for CORS.
- **UX:** Next 16 App Router, `proxy.ts` (not `middleware.ts`), server actions (`_action.ts` + `httpClient` server-only) for mutations, TanStack Query for browser reads, `@tanstack/react-form` + Zod + `Appfield.tsx`, shadcn + `@base-ui/react`.
- **Reliability/observability:** no queues, no OpenAPI, no test harness yet — gaps to close before production.

---

## 8. Technical architecture (summary)

```text
Browser → Next.js (client/) → Express /api/v1 (server/) → PostgreSQL (Prisma)
              proxy.ts              checkAuth
              _action.ts            controllers → services
              httpClient (server)   prisma / Better Auth API / Stripe / Cloudinary
```

- No pnpm workspace, no shared package, no repository layer.
- Server entry: `src/server.ts` → `src/app.ts` (`/api/v1` + `POST /webhook` + `GET /`).
- Client entry: `src/app/layout.tsx`; network gate `src/proxy.ts`.
- External: Better Auth via `auth.api.*` (HTTP handler not mounted), Nodemailer+EJS OTP mail, Cloudinary icons, Stripe checkout+webhook.

---

## 9. Data model (summary — fields per `server/prisma/schema/`)

- **Enums:** `Role` (ADMIN/SUPER_ADMIN/DOCTOR/PATIENT), `UserStatus`, `Gender`, `BloodGroup`, `AppointmentStatus`, `PaymentStatus`.
- **Identity:** `User` 1:1 `Patient`/`Doctor`/`Admin`; 1:N `Session`/`Account`; `Verification` OTP.
- **Care graph:** `Doctor` N:M `Speciality` (`DoctorSpeciality`); `Doctor` N:M `Schedule` (`DoctorSchedules` with `isBooked`); `Appointment` → patient+doctor+schedule, 1:1 optional `Prescription`/`Review`/`Payment`; `Patient` 1:N `MedicalReport`, 1:1 `PatientHealthData`.

---

## 10. API surface (mounted today — always re-verify)

Prefix `/api/v1`. Auth via `checkAuth` unless noted.

- `/auth`: register, login, `GET me`, refresh-token, change-password, logout, verify-email, forget-password, reset-password.
- `/users`: `POST create-doctor` (public as implemented), `POST create-admin` (super-admin).
- `/doctors`: GET list, GET by id, PUT, PATCH soft-delete (no auth as mounted).
- `/admin`: GET list (admin/super-admin/patient), GET by id (no auth as mounted), PUT/DELETE (super-admin).
- `/speciality`: POST create (auth commented out), GET list (patient), PATCH/DELETE (admin/super-admin).
- `/schedule`: POST/PATCH/DELETE (admin/super-admin), GET list + by id (admin/super-admin/doctor).
- `/doctor-schedules`: `/my` POST/GET/PATCH/DELETE (doctor), GET all + by ids (admin/super-admin/doctor).
- `/payment`: `POST create-payment-intent` (patient, miswired — see §7 traps).
- `/stats`: `GET /` (admin/super-admin).
- `POST /webhook` (Stripe, outside `/api/v1`).
- Commented out: `/appointments`.

---

## 11. UX / information architecture

- Public + auth group `app/(commonLayout)/`: home, login, register, verify-email, forgot/reset-password, consultation, doctor profile, diagnostics, medicines, health-plans, ngos.
- Patient group `app/(dashboardLayout)/(patientRouteGroup)/`: dashboard, my/book-appointments, my-prescriptions, health-records, payment success.
- Admin group `app/(dashboardLayout)/admin/dashboard/`: admins/doctors/patients/appointments/schedules/specialties/doctor-schedules/doctor-specialties/payments/prescriptions/reviews-management.
- Doctor group `app/(dashboardLayout)/doctor/dashboard/`: appointments, my-schedules, prescriptions, my-reviews.
- Shared protected group `app/(dashboardLayout)/(commonProtectedLayout)/`: my-profile, change-password.

---

## 12. Known limitations and traps (do not copy as patterns)

- Appointment booking is not public; do not build booking UI alone.
- Payment intent → webhook handler miswire; use `POST /webhook` as webhook reference.
- Auth gaps: public doctor routes, public `GET /admin/:id`, unauthenticated speciality create.
- Dual gate (session + JWT) + `console.log` of tokens in `checkAuth` — do not replicate logging.
- Client/server secret names differ (`JWT_ACCESS_SECRET` vs `ACCESS_TOKEN_SECRET`); refresh path mismatch (`/auth/refresh` client vs `/auth/refresh-token` server); Google buttons with no provider.
- Empty dashboard pages, placeholder `pnpm test`, unwired session TTL envs, `qs` query-parser without return, `catchAsync` bypass in speciality update.

---

## 13. Success metrics (proposed)

- Patient activation: % registered → verified → first booking (once live).
- Booking completion: % slot views → confirmed + paid appointments.
- Doctor setup: % doctors with ≥1 linked future slot.
- Operational: admin task time (create doctor/speciality/schedule), payment success rate, webhook latency.
- Quality: 5xx rate, auth failure rate, Zod rejection rate, P95 API latency.

---

## 14. Open questions / future work

- Finalize booking + payment-intent APIs and mount `/appointments`?
- Re-enable RBAC on doctor/speciality/admin-read paths?
- Prescription/review/health-record modules: scope order and MVP fields?
- Unify session model (Better Auth vs JWT) or document dual-gate permanently?
- Testing, OpenAPI, rate-limiting, audit logs, production images — which release?

---

## Appendix A — Where to verify

- Mounted APIs: `server/src/app/routes/index.ts` → module `*.route(s).ts`.
- Canonical backend pattern: `server/src/app/modules/schedule/`.
- Canonical form pattern: `LoginForm.tsx` + `login/_action.ts` + `src/zod/`.
- Nav/route truth: `client/src/lib/navItems.ts` + real `app/` routes.
- Auth truth: `docs/auth/hybrid-auth.md`.

## Appendix B — Glossary

- **Slot:** 30-minute schedule window. **Doctor-schedule:** link of doctor to slot with `isBooked`. **Speciality:** medical domain. **Super Admin:** can manage admins. **Soft-delete:** `isDeleted` flag, row retained.
