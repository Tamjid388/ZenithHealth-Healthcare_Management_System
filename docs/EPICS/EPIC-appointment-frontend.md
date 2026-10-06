# Epic: Appointment booking frontend (patient booking + my appointments + doctor appointments + admin view)

Conventions for all epics: server `_action.ts` + `httpClient` for mutations, TanStack Query prefetch + `HydrationBoundary` for reads, Zod + `@tanstack/react-form` + `AppField`, shadcn + lucide, no new deps. `NEXT_PUBLIC_API_URL` includes `/api/v1`, so client code uses relative paths (`/appointments/my`, never `/api/v1/appointments/my`).

Query reference: [`tanstack-query-prefetch-reference.md`](./tanstack-query-prefetch-reference.md) (prefetch + `useQuery` + mutation snippets quoted from this codebase).

Backend is complete and mounted (`server/src/app/routes/index.ts` → `/appointments`, `/doctor-schedules`, `/schedule`, `/doctors`). This epic is frontend-only. Do not change backend.

## How the whole thing works (simple terms)

Think of it like a bus-seat system, in 4 steps:

1. **Admin makes empty timetable slots** — e.g. "Monday 10:00–10:30, 10:30–11:00". This is the `schedule` table. APIs: `POST /schedule`, `GET /schedule`.
2. **Doctor claims slots they will work** — e.g. Dr. Karim clicks "I will take Monday 10:00–10:30". This creates a `doctorSchedules` row (`doctorId + scheduleId`, `isBooked: false`). APIs: `POST /doctor-schedules/my`, `GET /doctor-schedules/my`, `DELETE /doctor-schedules/my/:id`. The `my-schedules` page for this already exists — it is the reference pattern for this epic.
3. **Patient books one claimed slot** — e.g. Rahim picks Dr. Karim + "Monday 10:00" and presses Book. This creates an `appointment` row + flips that `doctorSchedules.isBooked` to `true` + creates an `UNPAID` payment placeholder row (Stripe comes in a later epic). API: `POST /appointments { doctorId, scheduleId }`. If two patients click the same slot, only one wins — the second gets "Slot already booked".
4. **Everyone views / cancels** — patient sees "My Appointments", doctor sees "Appointments", admin sees everything. Cancel is `PATCH /appointments/:id/cancel` (only `SCHEDULED` can be canceled; cancel frees the slot again if no other active appointment uses it; PAID refunds are manual in Stripe dashboard for now).

## Story: Rahim books Dr. Karim

> Rahim has a fever. He opens `/consultation`, finds Dr. Karim (fee ৳500), opens `/consultation/doctor/<id>` and sees green "Available" badges on Monday 10:00 and 10:30.
>
> He clicks "Continue in patient dashboard" → `/dashboard/book-appointments`. He picks Dr. Karim again, picks Monday 10:00, presses **Confirm booking**. The app calls `POST /appointments`. That Monday 10:00 badge now shows "Booked" for everyone else.
>
> Rahim goes to `/dashboard/my-appointments` and sees: "Dr. Karim — Mon 10:00 — SCHEDULED — UNPAID". He realizes he picked the wrong day, so he presses **Cancel**. The app calls `PATCH /appointments/:id/cancel`. Status becomes `CANCELED` and Monday 10:00 becomes green "Available" again.
>
> Meanwhile Dr. Karim opens `/doctor/dashboard/appointments` and sees Rahim's booking appear/disappear. Admin opens `/admin/dashboard/appointments-management` and sees every appointment in the hospital. Nobody touches payment yet — that stays `UNPAID` until the Stripe epic.

## Backend contract (already done — frontend just calls it)

| Method + path | Who | Body / notes |
|---|---|---|
| `POST /appointments` | PATIENT | `{ doctorId, scheduleId }` (Zod-validated). Creates appointment + `isBooked=true` + UNPAID payment row atomically |
| `GET /appointments/my` | PATIENT, DOCTOR | PATIENT sees own; DOCTOR sees own patients; ADMIN/SUPER_ADMIN sees all. QueryBuilder: `search` (doctor name/email), `filter` (`status`, `paymentStatus`, `doctorId`, `scheduleId`), paginate, sort. Include: `doctor.user`, `patient`, `schedule`, `payment` |
| `GET /appointments/:id` | PATIENT, DOCTOR, ADMIN, SUPER_ADMIN | Ownership-checked (patient must own, doctor must own). Returns same include set |
| `PATCH /appointments/:id/cancel` | PATIENT, DOCTOR, ADMIN, SUPER_ADMIN | Ownership-checked. Only `SCHEDULED` → `CANCELED`. Frees `doctorSchedules.isBooked` if no other active appointment on that slot |
| `GET /doctors` (public) + `GET /doctors/:id` (public) | anyone | Detail already includes `doctorSchedules.schedule[]` with `isBooked` + `reviews` + `appointments` — this is the slot source for the booking picker and the read-only Availability preview in `DoctorDetails.tsx` |
| `GET /doctor-schedules/my` | DOCTOR | Already used by `my-schedules` page — reuse as reference, no new work |

No new backend endpoints in this epic.

## Implementation rules (apply to every epic below)

1. **UI work uses the `ui-ux-pro-max` skill** — load it before building any page, dialog, table, or form, and follow its guidance for layout, spacing, accessibility, and states (loading / error / empty).
2. **After all epics are implemented, run a final review pass** over every touched file: fix bugs found, delete dead/unnecessary code (unused imports, console.logs, duplicated helpers, placeholder text), then re-run `pnpm lint` in `client/` until clean.

## Epic 1 — Book appointment (patient, the core flow)

- Route: `/dashboard/book-appointments` (stub today: `book-appointments/page.tsx` renders placeholder text). Patient-only (already under `patientProtectedRoutes` `/dashboard` pattern, no `authUtlils.ts` change).
- APIs: `GET /doctors` (doctor picker, reuse `doctors.service.ts`), `GET /doctors/:id` (slot picker source — `doctorSchedules[]` with `schedule` + `isBooked`; filter past slots client-side like `DoctorDetails.tsx:84-89` does), `POST /appointments` (new mutation).
- Logic: `appointments.types.ts` add `BookAppointmentInput { doctorId, scheduleId }` + `BookedAppointment` (appointment + paymentData); `zod/appointment.validation.ts` (`doctorId`, `scheduleId` non-empty, mirrors server `bookAppointmentZodSchema`); `book-appointments/_action.ts` (`"use server"`, validate, `httpClient.post("/appointments")`, return result, no redirect — copy `login/_action.ts` pattern); `BookAppointmentForm` leaf (`"use client"`, `@tanstack/react-form` + `AppField`, two-step: 1. select doctor [searchable combobox], 2. select open slot [grouped by date, `isBooked` disabled, past filtered], fee summary + `useMutation` → on success `invalidateQueries(["my-appointments"])` + link to `/dashboard/my-appointments`; on "Slot already booked" keep form open with `Alert` error).
- Prefetch doctors list server-side in `page.tsx` with `HydrationBoundary` (pattern: `my-schedules/page.tsx`); slot list loads client-side via `useQuery(["doctor", id])` when a doctor is picked.

## Epic 2 — My appointments list + detail + cancel (patient, enhance existing)

- Route: `/dashboard/my-appointments` (page + prefetch + `["my-appointments", params]` key already exist; `AppointmentsReviewList` leaf exists — extend it, don't replace the page pattern).
- APIs: `GET /appointments/my` (exists in `appointments.service.ts`), `GET /appointments/:id` (new service fn), `PATCH /appointments/:id/cancel` (new `_action.ts` mutation).
- Logic: extend `appointments.types.ts` (`MyAppointment` already has `id/status/doctor/schedule` — add `paymentStatus`, `videoCallingId`, `patient`, `payment` to match server include; extend query params with `status`, `paymentStatus`, `doctorId` filters); table/cards with search + status filter + pagination (`keepPreviousData`, copy `MySchedulesTable`); `ViewAppointmentModal` (doctor, schedule start/end, status + payment badges, video ID, fee); `CancelAppointmentDialog` (confirm text "Cancel appointment with {doctor} on {date}?", only when `status === "SCHEDULED"`; `useMutation` → `invalidateQueries(["my-appointments"])`; error stays open). UNPAID shown as informational badge — no pay button (Stripe is a later epic).

## Epic 3 — Doctor appointments list + detail + cancel

- Route: `/doctor/dashboard/appointments` (stub today: heading + "not implemented yet"). Doctor-only (already under `doctorProtectedRoutes` pattern, no `authUtlils.ts` change). Nav item already exists (`navItems.ts:49-52`).
- APIs: `GET /appointments/my` (same endpoint, server scopes by `req.user` doctor row — reuse `getMyAppointments` service), `GET /appointments/:id`, `PATCH /appointments/:id/cancel` (same action as Epic 2).
- Logic: copy Epic 2 pattern into `components/modules/doctor/appointments/` — `page.tsx` prefetch `["doctor-appointments", params]` + `HydrationBoundary`; `DoctorAppointmentsTable` (patient name/email via `patient` include, schedule time, status; search is doctor-name-oriented on server so client search should target patient fields locally or omit); `ViewAppointmentModal` shared shape with patient one but showing patient block; cancel allowed on `SCHEDULED` rows (doctor cancel also frees the slot per server logic).

## Epic 4 — Admin appointments view

- Route: `/admin/dashboard/appointments-management` (stub today: placeholder text). ADMIN + SUPER_ADMIN (already under `adminProtectedRoutes` pattern). Nav item already exists (`navItems.ts:97-99`).
- APIs: `GET /appointments/my` (same endpoint — server returns all rows for ADMIN/SUPER_ADMIN with no ownership filter), `GET /appointments/:id`, `PATCH /appointments/:id/cancel`.
- Logic: read-only table + view modal + cancel (same components as Epic 2/3, admin column set: patient, doctor, schedule, status, paymentStatus). Filters: `status`, `paymentStatus`, `doctorId` pass straight through to QueryBuilder. No create/edit — appointments are only created by patients via Epic 1.

## Epic 5 — Consultation detail booking entry (wire up the disabled button)

- Route: `/consultation/doctor/[id]` (exists, public; `DoctorDetails.tsx` already renders Availability with Available/Booked badges + fee sidebar).
- API: none new.
- Logic: replace the disabled "Online booking — coming soon" button (`DoctorDetails.tsx:468-474`) with an active CTA: logged-in PATIENT → link to `/dashboard/book-appointments?doctorId=<id>` (Epic 1 preselects that doctor); logged-out visitor → link to `/login?redirect=/dashboard/book-appointments?doctorId=<id>`; non-patient roles see "Booking is for patients" hint. Availability preview stays read-only (booking happens in dashboard). Keep "Continue in patient dashboard" secondary button as-is or merge into the one CTA.

## Epic 6 — Types + services + validation shared plumbing (do first, supports Epics 1–5)

- APIs: none new.
- Logic: extend `types/appointments.types.ts` (full row type matching server `appointmentInclude`: `doctor { user }`, `patient`, `schedule`, `payment`; `BookAppointmentInput`; filter params `status | paymentStatus | doctorId | scheduleId`; `DEFAULT_*` constants); `services/appointments.service.ts` add `getAppointmentById(id)` + keep `getMyAppointments(params)`; `app/(dashboardLayout)/(patientRouteGroup)/…/book-appointments/_action.ts` + shared `cancelAppointmentAction(id)` (`httpClient.patch("/appointments/:id/cancel")`); `zod/appointment.validation.ts` (book schema). All Epics 1–5 import from here — no per-page duplicated fetchers.

## Out of scope (explicitly not this epic)

- Payment/Stripe (server creates UNPAID placeholder; no pay-now UI, no webhook UI).
- Prescription / review / medical-report UI on top of appointments.
- Video-call UI (`videoCallingId` is displayed as text only).
- `my-schedules` rebuild (already implemented — reference pattern only).
- `schedules-management` / `doctor-schedules-management` admin rebuilds (separate epic if needed).

## UI mockups

### `/dashboard/book-appointments`
```
+------------------------------------------------------------------+
| Book Appointment                                                 |
| Choose a doctor, pick an open time, confirm.                     |
+------------------------------------------------------------------+
| Step 1 — Doctor  [Dr. Karim Hossain ▾]  fee ৳500 · ★4.8 (12)    |
| Search doctors [____________]                                    |
+------------------------------------------------------------------+
| Step 2 — Time (Mon 12 Jan)                                       |
|  [10:00–10:30 ✓]  [10:30–11:00 booked]  [11:00–11:30 ✓]         |
|  Past times hidden. Booked slots disabled.                       |
+------------------------------------------------------------------+
| Summary: Dr. Karim · Mon 12 Jan, 10:00–10:30 · Fee ৳500 (UNPAID) |
|                      [ Cancel ]  [ Confirm booking ]              |
+------------------------------------------------------------------+
| Success → "Booked!" + [View my appointments].                    |
| Error "Slot already booked" → stays on form + Alert.            |
```

### `/dashboard/my-appointments` (patient) + doctor/admin variants
```
+------------------------------------------------------------------+
| My Appointments                                                  |
| Search [____________]  Status [All ▾]  Total: n                   |
+------------------------------------------------------------------+
| Doctor | Schedule | Status | Payment | Actions                   |
| Karim  | Mon 10:00| SCHED  | UNPAID  | View Cancel               |
+------------------------------------------------------------------+
| < 1 2 3 >  Rows per page [10]                                    |
+------------------------------------------------------------------+
| View modal: doctor, patient (doctor/admin view), schedule,       |
|   status + payment badges, video ID (mono), fee.                 |
| Cancel dialog: "Cancel appointment with {doctor} on {date}?"     |
|   [Keep] [Cancel appointment] — only on SCHEDULED rows.          |
```

### `/consultation/doctor/[id]` change (Epic 5)
```
Sidebar card (was):
  [ Online booking — coming soon (disabled) ]
  [ Continue in patient dashboard ]
Becomes (patient logged in):
  [ Book this doctor → ]  (→ /dashboard/book-appointments?doctorId=…)
Logged out:
  [ Log in to book → ]    (→ /login?redirect=…)
Doctor/admin viewing:
  hint "Booking is for patients." (no CTA)
Availability grid: unchanged (Available green / Booked grey).
```
