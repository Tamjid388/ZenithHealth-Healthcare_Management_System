# Hybrid auth

This app uses **Better Auth sessions plus custom JWT cookies**. Official Better Auth Express (`toNodeHandler`) is **not** mounted. Services call `auth.api.*` (see `server/src/app/lib/auth.ts`). Do not add that HTTP mount unless the task asks.

Roles live in Prisma `Role` (`ADMIN`, `SUPER_ADMIN`, `DOCTOR`, `PATIENT`) in `server/prisma/schema/enums.prisma`.

## Cookie names (public contract)

Set on login/register in `client/src/app/(commonLayout)/(auth)/login/_action.ts` and `register/_action.ts` via `setTokenInCookies`:

| Cookie | Issuer | Typical consumer |
|--------|--------|------------------|
| `accessToken` | Server JWT (`ACCESS_TOKEN_SECRET`) | `proxy.ts`, `httpClient`, `checkAuth` |
| `refreshToken` | Server JWT (`REFRESH_TOKEN_SECRET`) | `proxy.ts` refresh path, `POST /auth/refresh-token` |
| `better-auth.session_token` | Better Auth session | `checkAuth` (Prisma `Session` row), some client fetches |

Changing a name requires proxy, httpClient, login/register actions, and `checkAuth` together.

## Two gates

**Next.js (`client/src/proxy.ts`):** mainly trusts `accessToken` / `refreshToken`. Verifies JWT with **`JWT_ACCESS_SECRET`**. Route ownership: `client/src/lib/authUtlils.ts` (filename misspelled; do not rename).

**Express (`server/src/app/middleware/checkAuth.ts`):** requires **both**:

1. `better-auth.session_token` cookie matching a non-expired Prisma `Session`, then user status + role.
2. `accessToken` cookie verified with **`ACCESS_TOKEN_SECRET`**, then role again.

Do not weaken this dual check.

## Env names (not aliases)

| Side | Variable | Used for |
|------|----------|----------|
| Client | `NEXT_PUBLIC_API_URL` | Axios/fetch base URL (`httpClient`, `auth.service.ts`) |
| Client | `JWT_ACCESS_SECRET` | `proxy.ts` JWT verify |
| Server | `ACCESS_TOKEN_SECRET` | Sign/verify access JWT |
| Server | `REFRESH_TOKEN_SECRET` | Refresh JWT |
| Server | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Better Auth config |
| Server | `FRONTEND_URL` | CORS |

Templates: `client/.env.example`, `server/.env.example`. Canonical server list: `server/src/app/config/env.ts`. **Do not assume** `JWT_ACCESS_SECRET` and `ACCESS_TOKEN_SECRET` are the same string in `.env` files; they are different **names**. Local values may be copied by humans; agents must not invent a third secret name.

## Known mismatches (record only; do not “fix” in docs-only work)

- **Refresh path:** server is `POST /api/v1/auth/refresh-token` (`auth.routes.ts`). Client `auth.service.ts` calls `${NEXT_PUBLIC_API_URL}/auth/refresh`. That is one broken client path, not a second endpoint. If asked to fix, point the client at `/auth/refresh-token` (plus the `/api/v1` prefix already in `NEXT_PUBLIC_API_URL` if that env includes it).
- **Google:** `LoginForm` / `RegisterForm` link to `${NEXT_PUBLIC_API_URL}/auth/google`. There is no Google provider in `server/src/app/lib/auth.ts` and no `/auth/google` route. Do not add OAuth unless tasked.
- **Token logging:** `checkAuth` currently `console.log`s session and access tokens. Do **not** copy that. Do not remove it in an unrelated PR.
- **Payment route:** `POST /api/v1/payment/create-payment-intent` is wired to `PaymentController.handleStripeWebhook`. Not an auth issue, but do not treat it as the webhook pattern. Real webhook: `POST /webhook` in `app.ts`.

## Client HTTP

`client/src/lib/axios/httpClient.ts` is server-only (`next/headers` `cookies()`). Forward cookies on the request. Do not import it in client components.

Auth routes (mounted): register, login, `/me`, refresh-token, change-password, logout, verify-email, forget-password, reset-password — see `server/src/app/modules/auth/auth.routes.ts`.
