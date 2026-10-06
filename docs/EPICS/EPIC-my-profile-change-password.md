# Epic: Profile + Admin user management (my-profile, change-password, admins-management, patients-management)

Conventions for all epics: server `_action.ts` + `httpClient` for mutations, TanStack Query prefetch + `HydrationBoundary` for reads, Zod + `@tanstack/react-form` + `AppField`, shadcn + lucide, no new deps. `NEXT_PUBLIC_API_URL` includes `/api/v1`, so client code uses relative paths (`/auth/me`, never `/api/v1/auth/me`).

Query reference: [`tanstack-query-prefetch-reference.md`](./tanstack-query-prefetch-reference.md) (prefetch + `useQuery` + mutation snippets quoted from this codebase).

## Implementation rules (apply to every epic below)

1. **UI work uses the `ui-ux-pro-max` skill** — load it before building any page, dialog, table, or form (Epics 2, 4, 5, 6, 8, 9), and follow its guidance for layout, spacing, accessibility, and states (loading / error / empty).
2. **After all epics are implemented, run a final review pass** over every touched file: fix bugs found, delete dead/unnecessary code (unused imports, console.logs, duplicated helpers, placeholder text), then re-run `pnpm lint` in each touched package (`client/`, and `server/` if backend changed) until clean.

## Epic 1 — Fix `change-password` nav href

- API: none.
- Logic: `client/src/lib/navItems.ts:35` — `href: "change-password"` → `href: "/change-password"`. Relative href breaks under `/dashboard/*` and `/admin/dashboard/*`. Verify with `pnpm lint` in `client/`.

## Epic 2 — My profile (view)

- API: `GET /auth/me` (exists, all 4 roles; returns `User` + `patient` / `doctor` includes).
- Logic: add `TMyProfile` type (don't reuse narrow `UserInfo`); add `services/profile.service.ts` (`httpClient.get("/auth/me")`, server-only); prefetch `["user","me"]` in `my-profile/page.tsx` with `HydrationBoundary` (pattern: `specialties-management/page.tsx`); read it in `MyProfileContent` leaf via `useQuery` with the same key + `staleTime` 5 min; skeleton on pending, `Alert` + Retry on error; role-aware tabs (patient counts, doctor specialities, admin role/status).

## Epic 3 — Update my profile (backend, new endpoint)

- API: `PATCH /users/me` (new, all 4 roles, actor from `req.user.userId` — never from body).
- Logic: `user.route.ts` append route with `checkAuth` + `validateRequest`; service updates `User` (`name`, `image`) + matching role table (`patient`/`doctor`/`admin`) in one `prisma.$transaction`; sync Better Auth name/image; return `getMe`-shaped profile. Email immutable (Better Auth identity, no verification flow). Doctor professional fields (`designation`, `appointmentFee`, …) not editable here — admin-managed via `PUT /doctors/:id`.

## Epic 4 — Update my profile (frontend, depends on Epic 3)

- API: `PATCH /users/me`.
- Logic: `zod/profile.validation.ts` (optional `name`, `profilePhoto`, `contactNumber`, `address` — no email); `updateMyProfile` server action via `httpClient.patch`; `EditProfileDialog` leaf (`useForm` defaults from `["user","me"]` cache + `useMutation`); on success `setQueryData(["user","me"])` + `invalidateQueries(["user"])` so header updates without reload; email shown read-only.

## Epic 5 — Change password

- API: `POST /auth/change-password` (exists; body `{ currentPassword, newPassword }`; rotates all 3 cookies).
- Logic: append Zod schema (`auth.validation.ts`, confirm-match + new ≠ current refines); `_action.ts` validates, posts via `httpClient`, re-sets rotated cookies, returns result (no `redirect()`); `ChangePasswordForm` leaf mirrors `LoginForm` (eye toggles, `Alert` error/success, `form.reset()` + `invalidateQueries(["user"])` on success).

## Epic 6 — Admins management UI (backend: user-centric over ADMIN + SUPER_ADMIN)

- APIs: `GET /admin` (lists `User` rows with role ADMIN/SUPER_ADMIN, each mapped to `{ id, adminId, userId, name, email, profilePhoto, contactNumber, role, status, … }` — works even when no `admin` table row exists), `GET /admin/:id` (resolves admin-row id or user id), `PUT /admin/:id` (SUPER_ADMIN only, body nests under `{ admin }`, upserts the profile row + syncs `User` name/image), `DELETE /admin/:id` (SUPER_ADMIN only, self-delete blocked), `POST /users/create-admin` (SUPER_ADMIN only).
- Logic: copy `doctors-management` pattern — `admins.types.ts` + `admins.service.ts`, prefetch `["admins", params]` page, `AdminsTable` (search/filter/pagination, `keepPreviousData`), Create/Edit/View/Delete modals, mutations invalidate `["admins"]`; render update/delete buttons for SUPER_ADMIN only (backend enforces, mirror in UI).

## Epic 7 — Patients read API (backend, new module)

- APIs: `GET /patients`, `GET /patients/:id` (both new, ADMIN + SUPER_ADMIN).
- Logic: new `server/src/app/modules/patient/` module (`route`, `controller`, `service`, `validation`) copying `schedule/`; list uses `QueryBuilder` (search `name,email,contactNumber`, `where: { isDeleted: false }`, paginate, no heavy includes); detail includes `user` + appointments/prescriptions/reviews/medicalReports/patientHealthData (same set as `getMe`); mount `router.use("/patients", patientRoutes)` in `routes/index.ts`. Read-only — no patient mutations in this epic.

## Epic 8 — Patients management UI (depends on Epic 7)

- APIs: `GET /patients`, `GET /patients/:id`.
- Logic: `patients.types.ts` + `patients.service.ts` (read functions only); prefetch `["patients", params]` page; `PatientsTable` + `ViewPatientModal` (read-only, no edit/delete buttons).

## Epic 9 — Reusable logout everywhere (logout exists only in dashboard avatar dropdown)

- API: `POST /auth/logout` via existing `logoutAction` (`app/(commonLayout)/(auth)/logout/_action.ts`) — no backend work.
- Logic: extract the `handleLogout` body from `UserDropdown.tsx:28-35` (`queryClient.clear()` + `await logoutAction()` + `unstable_rethrow`) into a reusable `"use client"` leaf `components/modules/dashboard/LogoutButton.tsx` with a `variant` prop (`menu-item` | `ghost` | `sidebar`); refactor `UserDropdown` to render it; add it to the 3 places missing logout — public `SiteHeader` navbar (logged-in state, next to Dashboard button), `DashboardSidebarContent` bottom user block, `DashboardMobileSidebar` bottom user block. `logoutAction` redirects server-side, so no client router push needed; on error keep the existing `unstable_rethrow` behavior.

## New endpoints

| Endpoint | Module |
|---|---|
| `PATCH /api/v1/users/me` | `server/src/app/modules/user/` |
| `GET /api/v1/patients` | `server/src/app/modules/patient/` (new) |
| `GET /api/v1/patients/:id` | `server/src/app/modules/patient/` (new) |

## UI mockups

### `/my-profile`
```
+----------------------------------------------------------+
| My Profile                          [role Badge: DOCTOR] |
| name@email.com · Member since Jan 2026                   |
+----------------------------------------------------------+
| [Avatar/photo or initial]  Dr. Karim Hossain             |
|                            karimhossain@gmail.com        |
|  Status: ACTIVE  | Email: Verified ✓  | Need pwd change: No |
+----------------------------------------------------------+
| [Account] [Professional]  <- tabs (role-aware)           |
|  Account tab: Name, Email, Role, Status, User ID (mono), |
|               Joined, Updated                             |
|  Professional tab (DOCTOR): Designation, Workplace,      |
|    Registration #, Experience, Fee, Qualifications,      |
|    Specialities [chips]                                   |
|  Professional tab (PATIENT): counts — Appointments (n),  |
|    Prescriptions (n), Reports (n) + link to /dashboard/* |
+----------------------------------------------------------+
| [ Edit profile ]  [ Change password → ]                  |
+----------------------------------------------------------+
States: loading → 2 skeleton cards; error → Alert + [Retry].
```

### Edit profile dialog
```
+----------------------------------------------------------+
| Edit profile                                    [x]      |
| Update your personal information                         |
+----------------------------------------------------------+
| Name            [Dr. Karim Hossain            ]           |
| Contact number  [01XXXXXXXXX                 ]           |
| Address         [House 12, Road 5, Dhaka     ]           |
| Profile photo   [https://…/photo.jpg         ]           |
| Email           karimhossain@gmail.com  (read-only)      |
|                                                          |
|                      [ Cancel ]  [ Save changes ]         |
+----------------------------------------------------------+
Success closes dialog + instant refresh; error stays open.
Doctor professional fields NOT here — admin-managed.
```

### `/change-password`
```
+--------------------------------------+
| Change Password                      |
| Choose a new password for            |
| name@email.com                       |
+--------------------------------------+
| Current password   [••••••••] [eye]  |
| New password       [••••••••] [eye]  |
|   hint: min 8 chars, ≠ current       |
| Confirm new pwd    [••••••••] [eye]  |
|                                      |
| [ Update password ]  (full-width)    |
|                                      |
| ✓ Password changed successfully      |
| ✗ Current password is incorrect      |
+--------------------------------------+
| ← Back to My Profile                 |
+--------------------------------------+
```

### `/admin/dashboard/admins-management`
```
+------------------------------------------------------------------+
| Admins                                    [+ Create admin]       |
| Search [____________]  Filter(isDeleted)  Total: n               |
+------------------------------------------------------------------+
| Avatar | Name | Email | Contact | Role | Status | Actions         |
|  AK    | …    | …     | …       | ADMIN| ACTIVE | View Edit Delete|
+------------------------------------------------------------------+
| < 1 2 3 >  Rows per page [10]                                    |
+------------------------------------------------------------------+
Create modal: Name, Email, Password(+show/hide), Contact, Address.
Edit modal:   Name, Contact, Profile photo (PUT, nested {admin}).
Delete modal: "Delete {name}? They will be signed out immediately."
              [Cancel] [Delete] — self-delete → error stays open.
```

### `/admin/dashboard/patients-management`
```
+------------------------------------------------------------------+
| Patients                                                         |
| Search [____________]  Total: n                                  |
+------------------------------------------------------------------+
| Name | Email | Contact | Appointments | Reports | Joined | [View]|
+------------------------------------------------------------------+
| < 1 2 3 >  Rows per page [10]                                    |
+------------------------------------------------------------------+
View modal: profile fields + counts (appointments/prescriptions/
reviews/reports) + member-since. NO edit/delete buttons.
```

### Logout placements (Epic 9)
```
SiteHeader (logged-in):  [Dashboard] [Log out(ghost, red icon)]
Dashboard sidebar bottom:
+--------------------------------+
| (A) Dr. Karim Hossain          |
|     Doctor               [⏻]   |  <- icon-button, tooltip "Log out"
+--------------------------------+
Mobile sidebar bottom:   same row + full-width [Log out] below.
Avatar dropdown:         unchanged item (now via LogoutButton).
```
