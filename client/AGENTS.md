<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ZenithHealth client — agent instructions

Repo-wide rules live in `../AGENTS.md`. This file is client-only.

## What this package is
Next.js 16 App Router UI. Domain API is the Express server, not Next Route Handlers.
No `app/api` for product endpoints. No `middleware.ts` — the gate is `src/proxy.ts`.

## Read first
- Gate + roles: `src/proxy.ts` + `src/lib/authUtlils.ts` (filename is misspelled; do not rename)
- Nav: `src/lib/navItems.ts` (hrefs must match real `app/` routes)
- Server-only HTTP: `src/lib/axios/httpClient.ts`
- Canonical form: `src/components/modules/auth/LoginForm.tsx` + `app/(commonLayout)/(auth)/login/_action.ts`
- Zod: `src/zod/`
- Env names: `.env.example` (`NEXT_PUBLIC_API_URL`, `JWT_ACCESS_SECRET` — not the server’s `ACCESS_TOKEN_SECRET`)
- Auth deep dive: `../docs/auth/hybrid-auth.md`

## Commands
From this folder: `pnpm dev` | `pnpm lint` | `pnpm build`
Package manager: pnpm.

## Route groups
- Public + auth: `app/(commonLayout)/` — `/`, `/login`, `/register`, `/consultation`, …
- Patient dashboard: `app/(dashboardLayout)/(patientRouteGroup)/` — `/dashboard/*`, `/payment/success`
- Admin: `app/(dashboardLayout)/admin/dashboard/`
- Doctor: `app/(dashboardLayout)/doctor/dashboard/` — layout + loading files; no `page.tsx` yet
- Shared logged-in: `app/(dashboardLayout)/(commonProtectedLayout)/` — `/my-profile`, `/change-password`

New protected route: add the page in the matching group, register it in `authUtlils.ts`, then update `navItems.ts` only if it should appear in the sidebar.

## Data and UI
- Mutations that need cookies: `"use server"` `_action.ts` + `httpClient`. Do not import httpClient in client components.
- Browser reads: fetch / TanStack Query (`src/providers/QueryProvider.tsx`).
- Forms: Zod + `@tanstack/react-form` + `components/shared/form/Appfield.tsx`. UI: shadcn in `components/ui` + `@base-ui/react` + lucide.
- Prefer server components. Keep `"use client"` at leaves (forms, dropdowns).

## Never
- Do not add Google OAuth; login/register `/auth/google` buttons are TODOs.
- Do not add `/auth/refresh`. Server refresh is `POST /api/v1/auth/refresh-token`. `services/auth.service.ts` currently calls the wrong path — fix that path if asked; do not invent a second endpoint.
- Do not treat empty or missing `page.tsx` files, or doctor `loading.tsx` files, as implemented features.
- Do not add booking/appointment UI unless the task says so (API route is unmounted on the server).
- Do not add react-hook-form, next-safe-action, or Radix as a direct dependency.
- Do not log tokens, cookies, or patient payloads. Do not commit `.env`.

## Workflow
Match an existing route group and LoginForm/_action pattern → smallest change → `pnpm lint` → do not expand scope.
