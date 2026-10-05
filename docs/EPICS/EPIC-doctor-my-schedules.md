# EPIC: Doctor Dashboard — Complete `/doctor/dashboard/my-schedules`

> **Status:** IMPLEMENTED (2026-10-05) — code changes listed in §3 are done.
> **Implemented in:** `client/src/app/(dashboardLayout)/doctor/dashboard/my-schedules/page.tsx` + `_action.ts`, `client/src/services/doctor-schedules.service.ts`, `client/src/types/doctor-schedules.types.ts`, `client/src/zod/doctor-schedule.validation.ts`, `client/src/components/modules/doctor/mySchedules/` (5 components). `pnpm lint` + `tsc --noEmit` clean.
> **Date:** 2026-10-05
> **Route:** `/doctor/dashboard/my-schedules`
> **Doc location:** `docs/EPICS/EPIC-doctor-my-schedules.md`
> **Related docs:** `docs/INDEX.md`, `docs/architecture/overview.md`, `docs/auth/hybrid-auth.md`, `AGENTS.md`, `client/AGENTS.md`, `server/AGENTS.md`

## 1. Goal

Replace the stub `DoctorSchedulesPage` with a full My Schedules experience for the `DOCTOR` role:

- View own `DoctorSchedules` (`isBooked`, linked `schedule.startDateTime/endDateTime`).
- Claim new schedules (from global `Schedule` pool → `POST /doctor-schedules/my`).
- Release unbooked schedules (`DELETE /doctor-schedules/my/:id`, bulk update via `PATCH /doctor-schedules/my`).
- Keep the exact advanced SSR + hydration pattern already used by the existing system (admin schedules/doctors management, admin dashboard, consultation).

No server route work is needed — the API is already mounted and live (verified below).

## 2. Current state (as-is, verified)

### 2.1 Client stub — TO BE REPLACED

**File:** `client/src/app/(dashboardLayout)/doctor/dashboard/my-schedules/page.tsx` (10 lines, stub):

```tsx
export default function DoctorSchedulesPage() {
  return (
    <div className="space-y-2 p-6">
      <h1 className="text-2xl font-bold">My Schedules</h1>
      <p className="text-sm text-muted-foreground">
        Doctor schedules page is not implemented yet.
      </p>
    </div>
  );
}
```

**File:** `client/src/app/(dashboardLayout)/doctor/dashboard/my-schedules/loading.tsx` — KEEP (already correct streaming skeleton: header shimmer + 6-card grid). No change planned unless column layout changes.

**File:** `client/src/app/(dashboardLayout)/doctor/dashboard/layout.tsx` — KEEP as-is (thin `Fragment` wrapper).

### 2.2 Already wired — DO NOT TOUCH

- `client/src/lib/navItems.ts:53-57` — `doctorNavItems` already links `My Schedules → /doctor/dashboard/my-schedules` (icon `Clock`).
- `client/src/lib/authUtlils.ts:37-40,67-69` — `doctorProtectedRoutes: /^\/doctor\/dashboard/` already protects the route; `getRouteOwner()` returns `DOCTOR`.
- `client/src/proxy.ts:110-120` — role gate redirects non-`DOCTOR` to their default dashboard. No proxy change.
- `server/src/app/routes/index.ts:22` — `router.use("/doctor-schedules", DoctorScheduleRoutes)` is **mounted/live**. No mount change.

### 2.3 Backend contract — ALREADY LIVE (no server change)

**File:** `server/src/app/modules/doctorschedule/doctorschedule.routes.ts`

```ts
router.post("/my", checkAuth(Role.DOCTOR), validateRequest(...), DoctorScheduleController.createMyDoctorSchedule);
router.get("/my", checkAuth(Role.DOCTOR), DoctorScheduleController.getMyDoctorSchedules);
router.patch("/my", checkAuth(Role.DOCTOR), validateRequest(...), DoctorScheduleController.updateMyDoctorSchedule);
router.delete("/my/:id", checkAuth(Role.DOCTOR), DoctorScheduleController.deleteMyDoctorSchedule);
```

**File:** `server/src/app/modules/doctorschedule/doctorschedule.controller.ts:28-46` — `getMyDoctorSchedules` reads `req.user` + `req.query`, returns `{ data, meta }` via `sendResponse`.

**File:** `server/src/app/modules/doctorschedule/doctorschedule.service.ts:49-84` — resolves `doctorId` from `user.userId`, then `QueryBuilder(...).search().filter().where({ doctorId }).paginate().include({ schedule: true, doctor: { include: { user: true } } }).sort().fields().dynamicInclude(...).execute()`.

Filter/search allowlist — **File:** `server/src/app/modules/doctorschedule/doctorschedule.constant.ts`:

```ts
export const doctorScheduleFilterableFields = ["doctorId","scheduleId","isBooked","doctor.name","doctor.email"];
export const doctorScheduleSearchableFields = ["doctorId","scheduleId","doctor.name","doctor.email"];
export const doctorScheduleIncludeConfig = { schedule: true, doctor: { include: { user: true } } };
```

> Note: `docs/architecture/overview.md:32` still lists `/doctor-schedules` as "commented / not public" — that doc is stale vs `routes/index.ts`. Do not act on the stale line; if this EPIC is implemented, update that doc line as a follow-up.

## 3. Files YOU WILL CHANGE (planned, not yet changed)

| # | File | Action | Why |
|---|------|--------|-----|
| 1 | `client/src/app/(dashboardLayout)/doctor/dashboard/my-schedules/page.tsx` | **MODIFY (main)** | Convert stub → async Server Component with prefetch + `HydrationBoundary` (see §4) |
| 2 | `client/src/app/(dashboardLayout)/doctor/dashboard/my-schedules/_action.ts` | **CREATE** | `createMyDoctorScheduleAction`, `updateMyDoctorScheduleAction`, `deleteMyDoctorScheduleAction` — `"use server"` + `httpClient` + Zod, copy `admin/dashboard/schedules-management/_action.ts` pattern |
| 3 | `client/src/services/doctor-schedules.service.ts` | **CREATE** | `getMyDoctorSchedules(params)` → `httpClient.get("/doctor-schedules/my", { params })`; `getAvailableSchedules()` → `httpClient.get("/schedule", ...)` for claim flow. Server-only (`"use server"`), same as `services/schedules.service.ts` |
| 4 | `client/src/types/doctor-schedules.types.ts` | **CREATE** | `DoctorSchedule`, `MyDoctorSchedulesQueryParams`, `DEFAULT_MY_SCHEDULES_LIST_PARAMS = { page: 1, limit: 10 }`; reuse `IDoctorScheduleItem` shape from `types/doctors.types.ts:148-156` |
| 5 | `client/src/components/modules/doctor/mySchedules/MySchedulesTable.tsx` | **CREATE** | `"use client"` table: `useQuery(["my-schedules", queryParams])`, `keepPreviousData`, URL sync, `DataTable` + view/release actions. Copy `components/modules/admin/schedulesManagement/SchedulesTable.tsx` |
| 6 | `client/src/components/modules/doctor/mySchedules/ClaimScheduleModal.tsx` + `ClaimScheduleForm.tsx` | **CREATE** | Modal + `@tanstack/react-form` + Zod (`scheduleIds: string[]`) → calls `_action.ts` create, `invalidateQueries(["my-schedules"])` |
| 7 | `client/src/components/modules/doctor/mySchedules/ReleaseScheduleDialog.tsx` (+ optional `ViewMyScheduleModal.tsx`) | **CREATE** | Confirm release; block when `isBooked === true`. Copy `DeleteScheduleDialog.tsx` |
| 8 | `client/src/zod/doctor-schedule.validation.ts` | **CREATE (if missing)** | `createMyDoctorScheduleZodSchema`, `updateMyDoctorScheduleZodSchema` — mirror `server/.../doctorschedule.validator.ts` field names exactly |
| 9 | `client/src/app/(dashboardLayout)/doctor/dashboard/my-schedules/loading.tsx` | **KEEP / minor tweak only** | Already matches future card/table skeleton; adjust only if table columns diverge |
| 10 | `server/*`, `proxy.ts`, `authUtlils.ts`, `navItems.ts` | **DO NOT CHANGE** | API mounted, route protected, nav linked |

## 4. Advanced SSR to implement (reference: existing system)

We will replicate the **canonical dashboard SSR pattern** used in 4 live places. Do not invent a new pattern.

### 4.1 Reference implementations (read these first)

1. `client/src/app/(dashboardLayout)/admin/dashboard/schedules-management/page.tsx:11-43` — closest reference (schedules domain, `searchParams` passthrough, `staleTime: 90s`).
2. `client/src/app/(dashboardLayout)/admin/dashboard/doctors-management/page.tsx:11-43` — same shape, different domain.
3. `client/src/app/(dashboardLayout)/admin/dashboard/page.tsx:6-19` — minimal prefetch + `HydrationBoundary`.
4. `client/src/app/(commonLayout)/consultation/page.tsx:11-26` — public variant of same pattern.
5. Client consumer: `client/src/components/modules/admin/schedulesManagement/SchedulesTable.tsx:350-360` — `useQuery({ queryKey, queryFn, placeholderData: keepPreviousData, staleTime })`.
6. Server fetch: `client/src/services/schedules.service.ts:12-18` — `"use server"` + `httpClient.get("/schedule", { params })` (cookie-forwarding axios, see `lib/axios/httpClient.ts:34-51`).
7. Provider: `client/src/providers/QueryProvider.tsx:11-54` — `makeQueryClient({ staleTime: 60s })` + `ReactQueryStreamedHydration`; server always creates a new client.

### 4.2 What the pattern does (why it is "advanced")

- **Async Server Component prefetch:** `page.tsx` is `async`, awaits `searchParams: Promise<...>`, creates a per-request `QueryClient`, `await queryClient.prefetchQuery({ queryKey, queryFn })` with the server-only `httpClient` (cookies forwarded via `next/headers`). HTML ships with data — no client waterfall, SEO/crawl friendly.
- **Dehydration → streamed hydration:** `<HydrationBoundary state={dehydrate(queryClient)}>` seeds the browser cache. `QueryProvider` uses `ReactQueryStreamedHydration` so Suspense boundaries stream without remounting the client.
- **URL as state:** `initialSearchParams` passed to the `"use client"` table; table hydrates `useState` from URL (`page`, `limit`, `sortBy/sortOrder`, range filters), then syncs back via `window.history.replaceState` (no full navigation). Same `queryKey` shape on server + client avoids refetch on mount (`staleTime: 90s` server prefetch, `60s` default client).
- **Instant pagination/sort/filter:** client `useQuery` uses `placeholderData: keepPreviousData` so page transitions keep old rows while fetching.
- **Streaming fallback:** co-located `loading.tsx` skeleton renders during SSR prefetch; `error.tsx`-style inline error block in table handles fetch failure without blank page.

### 4.3 Code snippet — reference (existing system, DO NOT EDIT)

From `client/src/app/(dashboardLayout)/admin/dashboard/schedules-management/page.tsx`:

```tsx
import { CreateScheduleModal } from "@/components/modules/admin/schedulesManagement/CreateScheduleModal";
import { SchedulesTable } from "@/components/modules/admin/schedulesManagement/SchedulesTable";
import { getSchedules } from "@/services/schedules.service";
import { DEFAULT_SCHEDULES_LIST_PARAMS } from "@/types/schedules.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface SchedulesManagementPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function SchedulesManagementPage({ searchParams }: SchedulesManagementPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["schedules", DEFAULT_SCHEDULES_LIST_PARAMS],
    queryFn: () => getSchedules(DEFAULT_SCHEDULES_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">Schedules</h1>
            <p className="mt-1 text-sm text-muted-foreground">Time slots available for doctor assignments.</p>
          </div>
          <CreateScheduleModal />
        </div>
        <SchedulesTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default SchedulesManagementPage;
```

Client half from `SchedulesTable.tsx`:

```tsx
const { data: schedulesDataResponse, isFetching, isError, error } = useQuery({
  queryKey: ["schedules", queryParams],
  queryFn: () => getSchedules(queryParams),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 30 * 3,
});
```

Server fetch from `services/schedules.service.ts`:

```ts
"use server";
import { httpClient } from "@/lib/axios/httpClient";

export const getSchedules = async (params = DEFAULT_SCHEDULES_LIST_PARAMS) => {
  return httpClient.get("/schedule", { params: params as Record<string, unknown> });
};
```

### 4.4 Code snippet — PROPOSED for `my-schedules/page.tsx` (to be written when EPIC is executed)

```tsx
import { ClaimScheduleModal } from "@/components/modules/doctor/mySchedules/ClaimScheduleModal";
import { MySchedulesTable } from "@/components/modules/doctor/mySchedules/MySchedulesTable";
import { getMyDoctorSchedules } from "@/services/doctor-schedules.service";
import { DEFAULT_MY_SCHEDULES_LIST_PARAMS } from "@/types/doctor-schedules.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface MySchedulesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function MySchedulesPage({ searchParams }: MySchedulesPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["my-schedules", DEFAULT_MY_SCHEDULES_LIST_PARAMS],
    queryFn: () => getMyDoctorSchedules(DEFAULT_MY_SCHEDULES_LIST_PARAMS),
    staleTime: 1000 * 30 * 3, // 90s — matches admin schedules-management
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              My Schedules
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Time slots you have claimed. Release unbooked slots or claim new ones.
            </p>
          </div>
          <ClaimScheduleModal />
        </div>
        <MySchedulesTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default MySchedulesPage;
```

Proposed service (`services/doctor-schedules.service.ts`):

```ts
"use server";
import { httpClient } from "@/lib/axios/httpClient";
import { DEFAULT_MY_SCHEDULES_LIST_PARAMS, type MyDoctorSchedulesQueryParams } from "@/types/doctor-schedules.types";

export const getMyDoctorSchedules = async (
  params: MyDoctorSchedulesQueryParams = DEFAULT_MY_SCHEDULES_LIST_PARAMS,
) => {
  return httpClient.get("/doctor-schedules/my", { params: params as Record<string, unknown> });
};
```

> Rules carried over: never import `httpClient` in `"use client"` components (use the `getMyDoctorSchedules` server function as `queryFn` or a fetch wrapper); mutations go through `_action.ts` (`"use server"` + Zod `safeParse` + `httpClient.post/patch/delete`), then `queryClient.invalidateQueries({ queryKey: ["my-schedules"] })`.

## 5. UI mockup (no code — visual contract only)

Style: shadcn + `@base-ui/react`, `font-heading`, `text-zh-blue-deep`, shared `DataTable` (search + range filters + sorting + pagination), lucide icons. Follows `SchedulesTable` + `loading.tsx` skeleton already in this folder.

```
┌─────────────────────────────────────────────────────────────────┐
│ My Schedules                              [+ Claim Schedule]    │
│ Time slots you have claimed. Release unbooked slots or claim    │
│ new ones.                                                       │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│ │ Total    │ │ Upcoming │ │ Booked   │ │ Free     │  (stat cards)│
│ │ 12       │ │ 8        │ │ 3        │ │ 9        │              │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
├─────────────────────────────────────────────────────────────────┤
│ [🔍 Search schedules...] [Start date: gte ▾ lte ▾] [End date ▾]  │
│ [Status: All ▾]                                    [Clear all]  │
├─────────────────────────────────────────────────────────────────┤
│ Start ▲        │ End          │ Duration │ Booked   │ Actions    │
│────────────────┼──────────────┼──────────┼──────────┼────────────│
│ May 12, 9:00AM │ May 12,9:30AM│ 30 min   │ ● Free   │ 👁 ✎ 🗑    │
│ May 12,10:00AM │ May 12,10:30 │ 30 min   │ ● Booked │ 👁 (locked)│
│ May 13, 9:00AM │ May 13,9:30AM│ 30 min   │ ● Free   │ 👁 ✎ 🗑    │
│ ...            │ ...          │ ...      │ ...      │ ...        │
├─────────────────────────────────────────────────────────────────┤
│ Showing 1–10 of 12                          [<] [1][2] [>] [10▾]│
└─────────────────────────────────────────────────────────────────┘

Modals:
- Claim Schedule (modal): multi-select of available global Schedules
  (date + start–end + duration) → [Cancel] [Claim selected]
- Release confirm (dialog): "Release May 12, 9:00 AM slot? Booked slots
  cannot be released." → [Cancel] [Release]
- View (modal): start/end/duration/created + booked badge + patient (if booked)

States:
- Loading (first paint): existing loading.tsx skeleton (header + 6 cards).
- Refetching: keepPreviousData — old rows stay, subtle row shimmer.
- Empty: "No schedules claimed yet. [Claim Schedule]".
- Error: red banner "Failed to load schedules. Please try again." (same as admin table).
- Guard: Release button disabled + tooltip "Booked — cannot release" when isBooked.
```

### Component breakdown (planned)

- `MySchedulesPage` (RSC): header + `ClaimScheduleModal` trigger + `MySchedulesTable`.
- `MySchedulesTable` (client): `DataTable` with columns `startDateTime | endDateTime | duration (derived) | isBooked badge | createdAt`, filters `startDateTime[gte/lte]`, `endDateTime[gte/lte]`, `isBooked`, search `searchTerm`, sort `sortBy/sortOrder`, pagination `page/limit` — all URL-synced like admin table.
- `ClaimScheduleModal/Form`: lists `GET /schedule` unclaimed future slots, checkbox multi-select, Zod `{ scheduleIds: string[].min(1) }`.
- `ReleaseScheduleDialog`: `DELETE /doctor-schedules/my/:scheduleId`, disabled when booked.
- `ViewMyScheduleModal` (optional): read-only details via `GET /doctor-schedules/:doctorId/:scheduleId`.

## 6. Acceptance criteria

- [ ] `/doctor/dashboard/my-schedules` as `DOCTOR` renders SSR-prefetched list (no client waterfall; view-source contains first rows).
- [ ] Refresh / deep-link with `?page=2&isBooked=false&startDateTime[gte]=...` restores table state.
- [ ] Claim → new rows appear after `invalidateQueries`; release unbooked → row removed; release booked → blocked with message.
- [ ] `loading.tsx` skeleton shows on hard navigation; error banner shows on API failure.
- [ ] `pnpm lint` passes in `client/`; no new server files; no `.env` committed; no tokens logged.
- [ ] `docs/architecture/overview.md:32,36` stale lines about doctor-schedules/doctor pages updated as follow-up.

## 7. Out of scope (explicitly DO NOT do)

- Appointment booking UI (`/appointments` is unmounted — see `routes/index.ts:23`).
- Google OAuth buttons, `/auth/refresh` second endpoint, extra auth routes (per `AGENTS.md` Never list).
- Prisma schema/migration changes or editing `server/src/generated/prisma`.
- `react-hook-form` / `next-safe-action` / Radix direct deps; use `@tanstack/react-form` + shadcn + `@base-ui/react`.
- Renaming `lib/authUtlils.ts` (misspelled, do not rename).

## 8. Verification plan (when implemented)

1. `pnpm lint` in `client/` (required by `AGENTS.md` workflow).
2. Manual: login as `DOCTOR` → `/doctor/dashboard/my-schedules` → check SSR HTML, paginate, filter, claim, release, booked-lock.
3. Manual: login as `ADMIN`/`PATIENT` → visiting the URL redirects to own dashboard (proxy gate).
4. Confirm no changes to `server/src/app/routes/index.ts` needed (`/doctor-schedules/my` already live).
