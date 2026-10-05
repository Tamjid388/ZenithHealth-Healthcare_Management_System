# Agentic documentation system — handover playbook

Reusable process for designing AI-agent context (Cursor, Codex, Claude Code, and similar) so agents work consistently, safely, and with less hallucination.

This file is a **human handover and playbook**. It is not always-loaded agent context. Copy it to another repo and fill in that repo’s facts; do not paste another project’s APIs, env names, or folder trees unchanged.

**How to use:** Sections 1–12 are the general method. Appendix A is a worked example from one engagement (split Next.js + Express app). Replace Appendix A when you apply this to a new project.

---

## 1. Goal

Build the **smallest** documentation and instruction set that materially improves an agent’s ability to:

- understand the repo
- change the right files
- run the right checks
- avoid inventing APIs, schema fields, libraries, and workflows

Optimize for **context efficiency**, not document volume.

---

## 2. Hard constraints

- Inspect the real repo first. Do not infer architecture from folder names.
- Do not invent product requirements.
- Do not duplicate source-of-truth files (schema, routes, `package.json`, env examples).
- Prefer official docs for the **actual** versions in `package.json`.
- Never put secrets, tokens, or private values in agent docs.
- Before proposing any new file, ask: *Will this file materially improve an agent’s ability to understand, modify, test, or safely operate this repository?* If no, skip it.

---

## 3. Method (run in order)

### Phase A — Repository discovery

Audit, with evidence from code and config:

1. Root layout and whether this is a monorepo, split packages, or a single app  
2. Package manager and scripts  
3. Framework and runtime  
4. TypeScript / lint / formatter  
5. Git ignore (especially whether `.cursor` is ignored)  
6. Env examples vs code that reads env  
7. Database schema and migrations  
8. API surface (mounted vs stubbed vs schema-only)  
9. Auth and authorization  
10. Frontend and backend architecture  
11. State, data fetching, validation, errors, logging  
12. Jobs, cache, integrations  
13. Tests, CI, Docker, deploy, observability  
14. Existing docs, Cursor rules, `AGENTS.md` / `CLAUDE.md` / `CODEX.md`, ADRs  

Record: entry points, modules, dependency direction, canonical examples, anti-patterns, generated files, files agents must not hand-edit.

### Phase B — Technology research

Research **only** stacks the repo actually uses. Prefer official sources:

- Framework file conventions (they change between major versions)  
- ORM generate/migrate rules  
- Auth library’s official mount path vs what the repo actually does  
- [Cursor project rules](https://cursor.com/docs/rules)  
- [AGENTS.md](https://agents.md/) (nested files; closest wins)  
- [Cursor skills](https://cursor.com/docs/skills) if you add task workflows  

### Phase C — Assessment

Write (even if only for yourself): overview, architecture-from-code, existing docs, existing agent instructions, gaps, architecture risks, convention inconsistencies, source-of-truth map.

### Phase D — Design (then implement)

Design hierarchy, then create only MUST-HAVE files. Keep always-on instructions short. Point at canonical code instead of copying it.

---

## 4. Instruction hierarchy (avoid duplication)

```text
GLOBAL (cross-tool, always)
  AGENTS.md                 # map, commands, SoT pointers, never-do
  CLAUDE.md                 # one-line @AGENTS.md if you use Claude Code

CURSOR-SCOPED
  .cursor/rules/*.mdc       # globbed or intelligent; almost never alwaysApply except guardrails

PACKAGE / AREA
  nested AGENTS.md          # only if multiple apps/packages with different conventions

ON DEMAND
  docs/*                    # architecture, unique auth, as-built — linked, not always-loaded
  skills                    # repeatable procedures only (new module, new route)
```

**Rules of placement**

| Put it here | If it is… |
|-------------|-----------|
| `AGENTS.md` | Commands, directory map, prohibitions, pointers — under ~150–200 lines |
| `.cursor/rules` | Enforceable conventions tied to file globs |
| Nested `AGENTS.md` | Package-only facts that would pollute the root |
| `docs/` | Explanations agents should open when the task matches |
| Skills | Multi-step “how we add an X” checklists |
| Nowhere | Anything already true in schema, routes, ESLint, or `package.json` |

Do not copy style guides into rules if ESLint/Biome already enforces them. Do not put a full API catalog in `AGENTS.md`.

Check `.cursor` **into git**. Cursor’s official guidance is that project rules are version-controlled. If root `.gitignore` lists `.cursor`, remove that ignore.

---

## 5. Cursor rules — how to write them

Official apply modes ([Cursor rules](https://cursor.com/docs/rules)):

| Mode | Frontmatter | Use for |
|------|-------------|---------|
| Always | `alwaysApply: true` | Tiny guardrails only (diff scope, package manager, no destructive git) |
| Auto | `globs:` | Stack conventions (frontend vs backend vs ORM) |
| Intelligent | `description:` only | Auth, security, rare but high-risk areas |
| Manual | neither | Rare procedures |

**Write concrete rules**, not “write clean code.”

Good: *Business logic stays in the service layer. HTTP adapters must not import the database client.*  
Bad: *Follow best practices.*

Point at a **canonical module** (“copy `modules/schedule/`”) instead of inventing a new architecture.

If a generic framework rule (Radix, react-hook-form, `middleware.ts`, Nest repositories) does **not** match `package.json` and source, delete or rewrite it. Wrong always-on rules cause more hallucination than no rules.

Keep each rule well under 500 lines; prefer several small files.

---

## 6. Source of truth (do not duplicate)

Typical mapping — replace paths with the repo’s real files:

| Area | Canonical source | Docs |
|------|------------------|------|
| Commands | `package.json` (or workspace scripts) | One list in `AGENTS.md` |
| Environment names | code that validates env + `.env.example` | Names only, never values |
| Database | schema + migrations | No prose column catalog |
| HTTP API | route/controller registration | As-built or OpenAPI **if it exists**; else routes win |
| Auth | auth config + middleware/proxy | Short dedicated doc **only if hybrid/unusual** |
| UI kit | component generator config + `components/ui` | Scoped frontend rule |
| Types/lint | `tsconfig`, ESLint/Biome | Do not restate in AGENTS |

When two docs overlap (e.g. PRD vs as-built vs README), pick **one** narrative. Banner the rest as superseded. Prefer **code** over stale README trees.

---

## 7. Large as-built documents (keep / move / replace)

When a long generated or hand-written system dump already exists (often named `*_DOCUMENTATION.md` or `prd.md`):

| Option | When |
|--------|------|
| **Keep in place** | Accurate, unique, too large to always-load. Default. |
| **Move once** | You want a `docs/` tree; **move**, do not copy. Leave a short pointer at the old path. |
| **Replace with new `docs/api`** | Almost never, if it would duplicate routes/schema. |
| **Rename for aesthetics** | Not required. Searchability of the current name is enough. |

Always add a short header:

- as-built / dated  
- not always-loaded  
- **verify live registration files** (router index, OpenAPI, gateway) before trusting a listed endpoint  

Do not require updating a 1,000+ line as-built file on every PR. Either regenerate periodically or freeze it.

---

## 8. Agent workflow (adapt paths)

1. Read root `AGENTS.md`.  
2. Read nested `AGENTS.md` for the package being edited.  
3. Open the **registration** file (router index, app routes, proxy/middleware).  
4. If auth/env: read the auth doc and the code that sets cookies/tokens.  
5. If UI or API is stubbed/unmounted/empty, **say so** — do not invent a parallel stack.  
6. Copy a sibling canonical module.  
7. Search existing helpers before adding utilities.  
8. Smallest coherent change (including actually **registering** new routes).  
9. Run the package’s real checks (`lint`, `typecheck`, targeted tests). Do not run placeholder `test` scripts that exit 1.  
10. Review diff: no generated files, no drive-by renames, no secrets.  
11. Update docs only if architecture, auth, env names, or public contracts changed.

---

## 9. Anti-hallucination checklist (customize)

Use these as a starting list; keep only items the repo can violate:

- [ ] Do not invent endpoints that are not registered.  
- [ ] Do not invent database fields; schema is source of truth.  
- [ ] Do not add libraries that contradict existing choices (check `package.json` first).  
- [ ] Do not edit generated clients, build output, or old migrations.  
- [ ] Do not “fix” official-docs patterns (e.g. mounting an auth HTTP handler) unless the task asks — document **actual** usage.  
- [ ] Do not log tokens or secrets.  
- [ ] Do not treat empty pages, commented routers, or TODO buttons as shipped features.  
- [ ] Do not silently change public contracts (URL paths, cookie names, response envelopes).  
- [ ] Do not standardize filenames/typos in drive-by PRs.  
- [ ] Match env **names** in client vs server; they are often different.

---

## 10. What to create (priority)

### MUST HAVE (most repos)

- Root `AGENTS.md`  
- Root `CLAUDE.md` pointer if Claude Code is used  
- Nested `AGENTS.md` per distinct package  
- `.cursor/rules/` committed: guardrails + one rule per major stack, correctly globbed  
- `.env.example` aligned with code  
- `docs/INDEX.md` if there is more than one doc  
- Human `README.md` that matches **pnpm/npm/yarn actually used**

### SHOULD HAVE (when complexity justifies)

- Short `docs/architecture/overview.md` (mounted vs not; app boundaries)  
- Auth doc **only if** auth is hybrid or easy to get wrong  
- Package READMEs  
- One or two **skills** for “add a module” / “add a route” if naming is inconsistent

### NICE TO HAVE (later)

- ADRs when you freeze a controversial decision  
- OpenAPI after the API is stable  
- Testing/deploy docs **after** those systems exist  
- Status matrices of UI vs API — only if many stubs exist

### Usually skip

- Second API encyclopedia  
- Database field prose  
- `CODEX.md` if `AGENTS.md` exists  
- Generic “clean code” rules  
- Skills for tools not in the repo

---

## 11. Documentation maintenance

| Change | Update |
|--------|--------|
| New registered route | Code is enough unless you maintain OpenAPI/as-built |
| New schema used by an API | Schema + migration; overview only if a new domain |
| Auth / cookie / env rename | Auth doc + env examples + AGENTS never-do if needed |
| New convention | Scoped rule or skill, not an AGENTS essay |
| Trivial UI or local refactor | No doc update |

---

## 12. Migration sequence (when implementing)

1. Stop gitignoring `.cursor` (keep ignoring `.env` and generated output).  
2. Add root `AGENTS.md` + `CLAUDE.md` + `docs/INDEX.md` if needed.  
3. Rewrite lying framework rules; glob frontend rules away from backend.  
4. Align env examples with code.  
5. Nested package `AGENTS.md`.  
6. Only the docs that prevent invented integrations (auth, boundaries).  
7. Trim human READMEs that still show create-app boilerplate.  
8. Banner superseded PRDs.  
9. Optional skills and ADRs last.

Do not mass-rename inconsistent files as part of a docs migration.

---

## 13. Risks

| Risk | Mitigation |
|------|------------|
| Too many `alwaysApply` rules | Guardrails only; stack rules use globs |
| Stale as-built vs live routes | Header: verify registration file |
| Docs that “fix” bugs | Record known mismatches; don’t pretend code matches |
| Copying this playbook as agent context | Keep this file out of always-on rules; link from INDEX as optional |
| Over-documenting a small repo | Stop after MUST HAVE |

---

## Official references

- Cursor rules: https://cursor.com/docs/rules  
- Cursor skills: https://cursor.com/docs/skills  
- AGENTS.md: https://agents.md/  
- Nested AGENTS.md / closest wins: Codex and Cursor both treat nested files as scoped; user prompts override  

Add framework/ORM/auth URLs that match **this** repo’s versions when you instantiate the playbook.

---

## Appendix A — Worked example (ZenithHealth)

Use this appendix as a **template of filled-in facts**, not as instructions for an unrelated repo.

**Repo shape:** Split packages `client/` (Next.js 16 App Router) + `server/` (Express 5, Prisma 7, PostgreSQL). Not a pnpm workspace. Domain API is Express `/api/v1`, not Next Route Handlers. Client gate is `src/proxy.ts` (not `middleware.ts`).

**Auth:** Hybrid Better Auth session cookie + JWT cookies. Better Auth HTTP handler is not mounted; services call `auth.api.*`. Document actual behavior; do not “correct” it to the Better Auth Express quickstart unless asked.

**SoT examples:**

- Mounted APIs → `server/src/app/routes/index.ts`  
- Schema → `server/prisma/schema/`  
- Prisma client → generated `server/src/generated/prisma` (do not hand-edit)  
- Env → `server/src/app/config/env.ts` + `.env.example` files  
- Client HTTP → `client/src/lib/axios/httpClient.ts` (server-only)

**Large as-built file:** Keep `docs/BACKEND_SYSTEM_DOCUMENTATION.md`. Do not rename or replace into `docs/api`. Add header: verify routes before trusting listed endpoints. Treat `server/prd.md` as superseded.

**Known traps (do not copy to other projects blindly):** refresh path client vs server; `JWT_ACCESS_SECRET` vs `ACCESS_TOKEN_SECRET`; Google buttons without a provider; empty dashboard `page.tsx`; unmounted appointment routes; payment route wired to webhook handler.

**MUST HAVE that was implemented in that engagement (check the tree):** root and nested `AGENTS.md`, `.cursor/rules` (guardrails, TypeScript, Next, Express, Prisma, security-auth), `docs/INDEX.md`, `docs/architecture/overview.md`, `docs/auth/hybrid-auth.md`, aligned env examples.

**This playbook’s place:** `docs/agentic-documentation-handover.md` — human/process only; not listed as always-read in `AGENTS.md`.
