# EPIC: Complete Partially-Implemented Backend Features

> **Status:** PLANNING ONLY — no server code changed in this EPIC.
> **Date:** 2026-10-05
> **Doc location:** `docs/EPICS/EPIC-complete-partial-backend-features.md`
> **Source of partials:** `../BACKEND_SYSTEM_DOCUMENTATION.md` §25 (Feature Matrix) + §26 (Current Backend Status), verified against `server/src/**` on 2026-10-05.
> **Related docs:** `docs/INDEX.md`, `docs/architecture/overview.md`, `docs/auth/hybrid-auth.md`, `AGENTS.md`, `server/AGENTS.md`
> **Canonical module pattern to copy:** `server/src/app/modules/schedule/` (`*.route(s).ts` → `catchAsync` + `sendResponse` → service → `prisma` / `auth.api.*` / Stripe). New routes **must** be registered in `server/src/app/routes/index.ts`.

## 1. Goal

Move every row marked `Partial` / `Needs Review` in `../BACKEND_SYSTEM_DOCUMENTATION.md` §25–§26 to `Complete`, without expanding scope into `Missing` domains (Prescription / Review / MedicalReport / PatientHealthData / Patient CRUD / OAuth remain future EPICs).

Concretely:

- Finish **Appointment booking HTTP API** (routes + validation + controller exports + mount).
- Close **Admin / Speciality auth gaps** (`GET /admin/:id` public, `POST /speciality/create-speciality` auth commented, hard-delete vs `isDeleted` flag).
- Fix shared correctness items that keep those features `Partial`: `validateRequest` double-`next`, wrong `uuidv7` import, missing `isBooked` guard, session TTL env unwired, token `console.log`s.
- **Payment deferred:** `Payment create-payment-intent` / Stripe checkout work is **removed from this EPIC** and will be implemented later in a dedicated payment EPIC (see §6).
- Leave `GET /doctors`, `GET /doctors/:id` public **by decision** (consultation page needs unauthenticated doctor listing) — document, don't gate.

No `server/*.ts` is edited by this file. This EPIC only lists **what will change** and the **business logic each endpoint will enforce** when a later task executes it.

## 2. Current state (as-is, verified — do not re-derive from `prd.md` or README)

### 2.1 Already DONE since the doc was written — EXCLUDED from this EPIC

These were `Partial` in the doc but are `Complete` in code today; the follow-up doc-sync task updates the doc, this EPIC does not redo them:

- `server/src/app/modules/doctorschedule/*` — fully implemented + mounted at `GET|POST|PATCH|DELETE /doctor-schedules` (`routes/index.ts:22`). Service has `createMany`, `QueryBuilder`, `isBooked:false` guards, composite-key lookup. Validator + constants + interfaces present.
- `server/src/app/modules/stats/*` — new module, mounted `GET /stats` (`routes/index.ts:21`), role-gated `ADMIN,SUPER_ADMIN`.
- `server/src/app/modules/user/user.route.ts:12-17` — `POST /users/create-doctor` now `checkAuth(ADMIN,SUPER_ADMIN)` (was public).
- `server/src/app/modules/user/user.service.ts` — `createDoctor` now `return result` + `throw error` on rollback (missing-return bug fixed).
- `server/src/app/modules/doctor/doctor.routes.ts:10-19` — `PUT|PATCH /doctors/:id` now `checkAuth(ADMIN,SUPER_ADMIN)` (was open).
- `server/src/app/modules/speciality/speciality.routes.ts:19` — `GET /speciality` now all four roles (was `PATIENT` only).
- `server/prisma/seed.ts` + `package.json: seed` + `prisma.config.ts: migrations.seed` — demo seed exists (doc still says "No seeders").

### 2.2 True remaining `Partial` / `Needs Review` (this EPIC's scope)

| # | Doc row | File evidence |
|---|---------|---------------|
| P1 | Appointment booking: `Partial` | `appointment.routes.ts` = 0 lines (empty); `appointment.validation.ts` = 0 lines (empty); `appointment.controller.ts` = 21 lines, defines `bookAppointment` but **no exported `AppointmentController` object**; `appointment.service.ts:1` has `import { uuidv7 } from "zod"` (wrong package); `appointment.service.ts:7` has unused `import app from "../../../app"`; `getMyAppointments` (lines 99-111) is a stub that loads patient+doctor and returns nothing, and is **not exported** (`export const AppointmentService = { bookAppointment }` only); booking marks `isBooked:true` without checking prior `isBooked===false`; `routes/index.ts:23` mount still commented `// router.use("/appointments", AppointmentRoutes)` |
| P2 | Admin management: `Partial (public get-by-id)` | `admin.route.ts:10` — `router.get("/:id", AdminController.getAdminById)` has **no** `checkAuth`. Siblings: `GET /` allows `ADMIN,SUPER_ADMIN,PATIENT`; `PUT|DELETE /:id` require `SUPER_ADMIN`. `admin.service.ts:8,23` has `console.log` of fetched admin; `getAllAdmins` has no pagination; `updateAdmin(id, updateData: any)` spreads `updateData.admin` with no Zod schema |
| P3 | Speciality CRUD: `Partial (auth gaps)` | `speciality.routes.ts:12-17` — `POST /speciality/create-speciality` has `// checkAuth(...)` commented out (public write). `speciality.service.ts:15-20` — `deleteSpecialityById` is a **hard** `prisma.speciality.delete` while schema has `isDeleted` flag (unused). `getAllSpecialities` is unbounded `findMany` (no pagination). `speciality.controller.ts:43-62` — `updateSpeciality` bypasses `catchAsync`/`sendResponse` with raw `try/catch → 500`; `createSpeciality` returns `200` not `201`; delete returns message `"Specialities fetched successfully"` (copy-paste) |
| P4 | Doctor CRUD: `Needs Review` (residual) | `doctor.routes.ts:7,9` — `GET /` + `GET /:id` still public. Writes are now gated (see §2.1). Decision needed: keep reads public for consultation vs gate. `doctor.interface.ts` rename already done (`qualification` → `qualifications`), no action |
| P5 | Shared hardening keeping P1–P4 `Partial` | `middleware/validateRequest.ts:9-13` — on Zod failure calls `next(error)` then **falls through** to `req.body = parseData.data; next()` (missing `return`, double-`next`). `lib/auth.ts:101-108` — session `expiresIn/updateAge/cookieCache` hardcoded to `60*60*60*24*1` while `env.ts` loads `BETTER_AUTH_SESSION_EXPIRES_IN / _UPDATE_AGE` (unwired). `middleware/checkAuth.ts` + `admin.service.ts` log session/access tokens and admin payloads to console |

> **Deferred:** Payment (`payment.route.ts` miswire, `Payment create-payment-intent`, Stripe checkout inside `appointment.service.ts`) is intentionally out of scope here and moves to a future payment EPIC. Do not touch `server/src/app/modules/payment/*` in this EPIC.

## 3. Files YOU WILL CHANGE (planned, not yet changed)

> Convention: `MODIFY` = edit existing file; `CREATE` = new file. Follow `server/AGENTS.md`: copy `schedule/` shape, keep `*.route.ts` vs `*.routes.ts` filenames as-is (no mass rename in feature PR), business logic in services only (no Prisma in controllers), no repository layer.

| # | File | Action | Why (maps to P#) |
|---|------|--------|------------------|
| 1 | `server/src/app/modules/appointment/appointment.validation.ts` | **MODIFY (empty → Zod schemas)** | P1 — add `bookAppointmentZodSchema { doctorId: string.min(1), scheduleId: string.min(1) }` + `updateAppointmentZodSchema { status?: enum }`. No validation exists today |
| 2 | `server/src/app/modules/appointment/appointment.controller.ts` | **MODIFY** | P1 — export `AppointmentController = { bookAppointment, getMyAppointments, getAppointmentById, cancelAppointment }`; wrap each in `catchAsync` + `sendResponse` with `201` on book, `200` on reads/cancel; enforce `req.user` presence check (copy `doctorschedule.controller.ts:9-14` pattern) |
| 3 | `server/src/app/modules/appointment/appointment.service.ts` | **MODIFY** | P1 — fix imports (`uuidv7` from `node:crypto` `randomUUID` like `prisma/seed.ts:2`, drop `import app`); add `isBooked===false` guard on `doctorSchedules` read/update (fail with `400 Already booked`); finish `getMyAppointments(user, query)` with `QueryBuilder` pagination + role branch (PATIENT by `user.email`, DOCTOR by `user.userId`, ADMIN/SUPER_ADMIN all); add `getAppointmentById` + `cancelAppointment` with ownership checks. No Stripe call in this EPIC (deferred — see §6) |
| 4 | `server/src/app/modules/appointment/appointment.interface.ts` | **MODIFY (extend)** | P1 — keep `IAppointmentPayload`; add `IAppointmentQueryParams` extension of `IQueryParams` + `IUpdateAppointmentStatus { status: AppointmentStatus }` using Prisma enums (replace loose `status?: string`) |
| 5 | `server/src/app/modules/appointment/appointment.routes.ts` | **MODIFY (empty → router)** | P1 — create `AppointmentRoutes` router with 4 routes (see §4 WS1). Copy `schedule.route.ts` wiring order: `checkAuth` → `validateRequest` → controller |
| 6 | `server/src/app/routes/index.ts` | **MODIFY (1 line)** | P1 — uncomment/import `AppointmentRoutes` and mount `router.use("/appointments", AppointmentRoutes)`. This single line is what makes P1 public; verify before treating as API (per doc header rule) |
| 7 | `server/src/app/modules/admin/admin.route.ts` | **MODIFY (1 line)** | P2 — add `checkAuth(Role.ADMIN, Role.SUPER_ADMIN)` to `GET /admin/:id` (line 10). Decide PATIENT inclusion explicitly; default **exclude** PATIENT for PII (list allows PATIENT today — keep list as-is, gate detail) |
| 8 | `server/src/app/modules/admin/admin.service.ts` | **MODIFY** | P2 — remove `console.log`s (lines 8, 23); add pagination to `getAllAdmins(query: IQueryParams)` via `QueryBuilder` (copy `doctor.service.ts` list); add `updateAdminZodSchema` usage / typed payload replacing `any` |
| 9 | `server/src/app/modules/admin/admin.validator.ts` | **MODIFY or CREATE schema** | P2 — add `updateAdminZodSchema` if missing; wire with `validateRequest` on `PUT /admin/:id` in `admin.route.ts` |
| 10 | `server/src/app/modules/speciality/speciality.routes.ts` | **MODIFY (1 line)** | P3 — uncomment `checkAuth(Role.ADMIN, Role.SUPER_ADMIN)` on `POST /speciality/create-speciality` (line 13) |
| 11 | `server/src/app/modules/speciality/speciality.service.ts` | **MODIFY** | P3 — change `deleteSpecialityById` hard `delete` → soft `update({ isDeleted: true })`; add `isDeleted:false` filter to `getAllSpecialities` + paginate via `QueryBuilder`; type `updateSpeciality(id, payload: Partial<Speciality>)` replacing `any` |
| 12 | `server/src/app/modules/speciality/speciality.controller.ts` | **MODIFY** | P3 — wrap `updateSpeciality` in `catchAsync` + `sendResponse`; fix status codes (`201` create) and copy-paste messages (delete → `"Speciality deleted successfully"`) |
| 13 | `server/src/app/middleware/validateRequest.ts` | **MODIFY (1 line)** | P5 — add `return` before/after `next(parseData.error)` so failure path does not fall through to `req.body = ...; next()`. Touches every Zod-gated route — regression-test all modules |
| 14 | `server/src/app/lib/auth.ts` | **MODIFY (session block only)** | P5 — wire `expiresIn`/`updateAge`/`cookieCache.maxAge` from `envVars.BETTER_AUTH_SESSION_*` (parse int) instead of hardcoded `60*60*60*24*1`. No plugin/field changes |
| 15 | `server/src/app/middleware/checkAuth.ts` | **MODIFY (delete lines)** | P5 — remove `console.log` of session/access tokens. Never log tokens, cookies, OTP, health fields (per `AGENTS.md` Never) |
| 16 | `server/src/app/modules/doctor/doctor.routes.ts` | **NO CHANGE (decision record)** | P4 — keep `GET /`, `GET /:id` public for `(commonLayout)/consultation` doctor listing. Record decision in code comment + doc; revisit only if PII concern raised |

Explicitly **DO NOT CHANGE** in this EPIC: `server/src/app/modules/payment/*` (deferred to future payment EPIC), `server/src/app/modules/doctorschedule/*`, `server/src/app/modules/stats/*`, `server/src/app/modules/user/*`, `server/src/app/modules/schedule/*`, `server/src/app.ts` webhook, `server/prisma/schema/*` (no new columns — do not invent Prisma fields), `server/src/generated/prisma/*`, `client/*`, `proxy.ts`, OAuth.

## 4. Business logic of the endpoints you are adding / fixing (no code — contract only)

### WS1 — Appointment (P1). Base: `/api/v1/appointments`. Pattern: `schedule/` + `doctorschedule/` ownership style.

**`POST /api/v1/appointments` — Book appointment (PATIENT only)**
- Auth: `checkAuth(Role.PATIENT)` (dual session+JWT via existing middleware; do not weaken).
- Validation: `bookAppointmentZodSchema` → `{ doctorId: uuid/string.min(1), scheduleId: uuid/string.min(1) }`. `validateRequest` runs before controller; multipart not needed (JSON only).
- Service steps (payment-deferred variant — no Stripe in this EPIC):
  1. Resolve patient by `user.email` (`findFirstOrThrow` — 404 if no patient row; register creates it).
  2. Load doctor by `payload.doctorId` with `isDeleted:false` — 404 if deleted/missing.
  3. Load `DoctorSchedules` by composite `(doctorId, scheduleId)` — 404 if doctor never claimed that slot; `400 Already booked` if `isBooked===true` (new guard; current code lacks it — double-booking risk in doc §12).
  4. DB transaction (only DB writes): create `Appointment { videoCallingId: randomUUID(), patientId, doctorId, scheduleId, status: SCHEDULED, paymentStatus: UNPAID }`; update `DoctorSchedules.isBooked=true` with `where: { doctorId_scheduleId, isBooked:false }` (atomic); create `Payment { amount: doctor.appointmentFee, transactionId: randomUUID(), status: UNPAID, appointmentId }` as a placeholder row (stays `UNPAID` until the future payment EPIC).
  5. Return `201 { appointment, paymentData }` via `sendResponse` (no `paymentUrl` in this EPIC — Stripe checkout moves to the future payment EPIC).
- Errors: `401` no session/JWT; `403` non-PATIENT; `404` patient/doctor/slot; `400` already-booked / Zod.

**`GET /api/v1/appointments/my` — My appointments (PATIENT + DOCTOR, paginated)**
- Auth: `checkAuth(PATIENT, DOCTOR)`.
- Query: reuse `IQueryParams` (`page, limit, sortBy, sortOrder, searchTerm, filters`) via `QueryBuilder` (copy `getMyDoctorSchedules` chain: `search().filter().where(ownership).paginate().include().sort().execute()`).
- Ownership: PATIENT → `where: { patient: { email: user.email } }`; DOCTOR → resolve `doctorId` from `user.userId` then `where: { doctorId }`.
- Include: `doctor { user, specialities }`, `patient`, `schedule`, `payment (status only)`. Returns `{ data, meta }`.

**`GET /api/v1/appointments/:id` — Detail with ownership**
- Auth: `checkAuth(PATIENT, DOCTOR, ADMIN, SUPER_ADMIN)`.
- Logic: `findUniqueOrThrow` with same includes; then ownership gate — PATIENT may read only own `patientId`, DOCTOR only own `doctorId`; ADMIN/SUPER_ADMIN may read any. `403` on cross-owner read, `404` if missing.

**`PATCH /api/v1/appointments/:id/cancel` — Cancel (owner or admin)**
- Auth: `checkAuth(PATIENT, DOCTOR, ADMIN, SUPER_ADMIN)` + `updateAppointmentZodSchema { status: CANCELED }` (or dedicated cancel route with no body).
- Logic: only `SCHEDULED` → `CANCELED` transition allowed (`400` otherwise); if `paymentStatus===PAID`, leave refund to manual/Stripe dashboard (no auto-refund in this EPIC); free the slot via `doctorSchedules.update({ isBooked:false })` only when no other active appointment holds it. Returns `200` updated appointment.

### WS2 — Admin / Speciality / Doctor gating (P2–P4)

**`GET /api/v1/admin/:id` — Gate detail (ADMIN, SUPER_ADMIN)**
- Change: add `checkAuth(ADMIN, SUPER_ADMIN)`; service keeps `findUnique + user include`, `404` if missing. Removes PII exposure noted in doc §15. List `GET /admin` keeps current roles (no change).

**`POST /api/v1/speciality/create-speciality` — Gate create (ADMIN, SUPER_ADMIN)**
- Change: uncomment `checkAuth`; keep `multerUpload.single("file")` → `validateRequest(CreateSpecialityZodSchema { title, description? })` → controller merges `icon: req.file?.path` → service create. Unauthenticated catalog writes stop; Cloudinary cleanup on error (global handler) unchanged.

**`DELETE /api/v1/speciality/:id` — Soft-delete semantics**
- Change: service flips to `update({ isDeleted:true })`; all reads add `where: { isDeleted:false }`. Current hard `delete` contradicts schema flag and orphans `DoctorSpeciality` rows — after fix, add `findFirstOrThrow({ isDeleted:false })` guard returning `404` on already-deleted.

**`PUT|PATCH /doctors/:id`, `GET /doctors*` — No new endpoints**
- Writes already gated; reads stay public for consultation listing (detail includes specialities/schedules/reviews but no auth secrets). Record as intentional in doc update.

### WS3 — Shared hardening (P5, no new endpoints)

- `validateRequest`: failure path becomes `return next(parseData.error)` — single `next` call; success path unchanged (`req.body = parseData.data; next()`). Prevents `req.body` overwrite on invalid input across all P1–P4 routes.
- `lib/auth.ts` session: `expiresIn/updateAge/maxAge` parsed from `BETTER_AUTH_SESSION_EXPIRES_IN / _UPDATE_AGE` env (seconds); removes config drift flagged in doc §4/§15.
- Logging: strip token/session/admin dumps from `checkAuth.ts` + `admin.service.ts`; keep `console.error` for Stripe-signature failures only.

## 5. Acceptance criteria (must all hold before doc rows flip to Complete)

- [ ] `POST /appointments` as PATIENT with valid `doctorId+scheduleId` returns `201 { appointment, paymentData }` (no `paymentUrl` in this EPIC); second booking of same slot returns `400`.
- [ ] `GET /appointments/my?page=1&limit=10` as PATIENT returns only own rows with `{ data, meta }`; as DOCTOR returns only own doctor rows; cross-owner `GET /:id` returns `403`.
- [ ] `GET /admin/:id` without cookies → `401`; as PATIENT → `403`; as ADMIN → `200`.
- [ ] `POST /speciality/create-speciality` without ADMIN cookies → `401/403`; `DELETE /speciality/:id` sets `isDeleted:true` (row still in DB) and subsequent `GET` hides it.
- [ ] Invalid body on any Zod route calls `next` exactly once (no `req.body` overwrite; error maps via `hadnleZodError`).
- [ ] `pnpm lint` passes in `server/`; no new Prisma columns/migrations in this EPIC; no `.env` committed; no tokens/OTP/health payloads logged.
- [ ] `../BACKEND_SYSTEM_DOCUMENTATION.md` §§25–26 updated in a separate doc task after code merges (this EPIC does not edit it).

## 6. Out of scope (explicitly DO NOT do)

- **Payment (deferred to a future EPIC):** `POST /payment/create-payment-intent` rewire, `PaymentController.createPaymentIntent` / `PaymentService.createPaymentIntent`, `payment.validation.ts`, Stripe checkout in `appointment.service.ts`, and any `POST /webhook` changes. `server/src/app/modules/payment/*` stays as-is here.
- Prescription / Review / MedicalReport / PatientHealthData / Patient-profile HTTP modules (doc `Missing` — separate EPICs; schema already exists under `prisma/schema/`).
- Better Auth `toNodeHandler` mount, Google OAuth, extra refresh paths (`POST /auth/refresh` client mismatch stays as documented in `hybrid-auth.md`).
- New Prisma fields/migrations, editing `src/generated/prisma`, rewriting applied migration SQL.
- Rate limiting, Redis/cache, queues/cron, OpenAPI/Swagger, graceful shutdown, production Docker switch (all doc `Missing` — separate EPICs).
- Client booking UI (per `AGENTS.md` Never: do not complete booking with UI only; UI EPIC waits on this EPIC's mount).
- Renaming `*.route.ts` vs `*.routes.ts`, fixing `globalErroHandler`/`hadnleZodError` typos, `react-hook-form`/`next-safe-action` additions.

## 7. Verification plan (when implemented, not now)

1. `pnpm lint` in `server/` (required by `AGENTS.md` workflow: smallest change → lint).
2. Manual via Thunder Client/curl: register → login as PATIENT → `POST /appointments` → `GET /appointments/my`; login as ADMIN → `GET /appointments/:id`; cancel flow; `GET /admin/:id` role matrix; speciality create/delete.
3. Confirm `routes/index.ts` shows `/appointments` uncommented and only `/appointments` changed in mount set; `payment/*` untouched; confirm no secret values in responses/logs.

---

*End of EPIC — planning only. Execution task will reference this file and implement WS1→WS3 in order, one workstream per PR. Payment ships later in its own EPIC.*
