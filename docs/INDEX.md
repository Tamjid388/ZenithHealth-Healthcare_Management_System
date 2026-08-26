# Documentation index

Configuration and code stay canonical. Read these docs only when the task needs the map.

| Need | Read |
|------|------|
| Repo map, commands, never-do | [`AGENTS.md`](../AGENTS.md) then `client/AGENTS.md` or `server/AGENTS.md` |
| Two apps, mounted vs not, empty UI | [`architecture/overview.md`](architecture/overview.md) |
| Cookies, JWT vs Better Auth, env names, known mismatches | [`auth/hybrid-auth.md`](auth/hybrid-auth.md) |
| Mounted HTTP paths | `server/src/app/routes/index.ts` then the module `*.route(s).ts` |
| Database fields | `server/prisma/schema/` |
| Env names | `server/src/app/config/env.ts`, `server/.env.example`, `client/.env.example` |
| Backend narrative (on-demand) | [`BACKEND_SYSTEM_DOCUMENTATION.md`](../BACKEND_SYSTEM_DOCUMENTATION.md) — **verify** `routes/index.ts` first |
| Older backend write-up | `server/prd.md` (superseded; not a live contract) |

Do not always-load the as-built backend file. Do not copy APIs from README or `prd.md`.
