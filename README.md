# Relay — Lead Management Platform

A production-ready lead management platform: public lead capture, session-based
auth with role-based access control, a full lead lifecycle (status, assignment,
notes, activity trail), an analytics dashboard, and admin user management.

Built as a layered Next.js (App Router) application with a strict service and
repository seam, where authorization is enforced at the data layer so it cannot
be bypassed.

## Features

- Public lead capture form (no auth) with server-forced fields.
- Auth.js (NextAuth v5) credentials login, JWT sessions, RBAC (ADMIN / MEMBER).
- Leads: list with search, status/tag/source filters, sorting and pagination;
  detail view with a guarded status lifecycle, assignment, notes and a full
  activity timeline. Soft delete (recoverable), admin-only.
- MEMBERs only ever see and act on leads assigned to them — enforced in the
  repository, not by hiding UI.
- Dashboard: totals, new-today, last-7-days, conversion rate, leads-by-status
  and a 6-month trend chart, plus a scoped recent-activity feed.
- Admin: user management (create / edit role & password / delete) with
  last-admin and self-delete guards. Profile and Settings pages. Light/dark mode.
- Consistent REST API with a single error envelope and Zod validation on every
  input. Tests (Jest + RTL) and an E2E smoke suite (Playwright).

## Tech stack

Next.js 15 (App Router, Server Components + Server Actions), TypeScript (strict),
MongoDB Atlas + Mongoose, Auth.js v5, Tailwind CSS + shadcn/ui, React Hook Form +
Zod, TanStack Query (client mutations only), Recharts, Jest + Testing Library,
Playwright. Deploys to Netlify.

## Architecture

Every request flows through clear layers, top to bottom:

```
route / server component
  -> service      (business rules: transitions, RBAC decisions, activity logging)
    -> repository  (data access + MANDATORY authorization scoping)
      -> model     (Mongoose schema)
```

Key decisions:

- **Authorization is layered and bottom-anchored.** Middleware does coarse
  redirects, service guards throw 401/403, and the repository merges a scope on
  every read and write (`deletedAt: null` always; `assignedTo: self` for
  MEMBERs). Bypassing the upper layers still yields nothing.
- **DTOs at the boundary.** Mongoose documents never cross to client components;
  services map to plain serializable DTOs (string ids, ISO dates).
- **One source of truth for the domain.** Enums, the status-transition map and
  `canTransition()` live in `src/types` and are shared by models, Zod schemas
  and services, so there is no drift.
- **Server Components fetch through services directly.** Only genuinely
  interactive pieces (filters, status/assignee selects, forms, delete confirm)
  are client islands that call the REST API and then `router.refresh()`.
- **Edge-safe auth split.** `src/lib/auth/config.ts` (no Node deps) is used by
  middleware; `src/auth.ts` adds the Credentials provider on the Node runtime.

## Folder structure

```
src/
  app/
    (public)/           public landing + capture form
    (auth)/login/       sign-in
    (dashboard)/        authenticated app (dashboard, leads, assigned, users, profile, settings)
    api/                REST endpoints (leads, users, profile, dashboard, auth)
    unauthorized/
  components/
    ui/                 shadcn primitives
    shared/             sidebar, badges, theme toggle, empty state
    features/           lead, note, dashboard, user, auth feature components
  lib/
    auth/               config, guards
    db/                 mongoose connection (cached for serverless)
    repositories/       data access + scoping
    services/           business logic
    validations/        Zod schemas
    api/                response envelope + client fetch helper
    utils/              errors, formatting, cn
    mappers.ts          document -> DTO
  models/               Mongoose schemas
  types/                domain enums, rules, DTOs
scripts/seed.ts         idempotent demo seed
e2e/                    Playwright specs
```

## Getting started

### Prerequisites
- Node.js 20+ (see `.nvmrc`)
- A MongoDB Atlas cluster (or any MongoDB connection string)

### 1. Install
```bash
npm install
```

### 2. Configure environment
Copy the example and fill in values:
```bash
cp .env.example .env.local
```
- `MONGODB_URI` — your Atlas connection string.
- `AUTH_SECRET` — generate one with `npx auth secret`.
- `AUTH_URL` — `http://localhost:3000` for local dev.
- `SEED_*` — optional overrides for the seeded accounts.

### 3. Seed the database
```bash
npm run seed
```
Creates one admin, one member and eight sample leads with notes and activity.

Default credentials:
| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@digitalheroes.test | Admin@12345 |
| Member | member@digitalheroes.test | Member@12345 |

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000. The landing page is the public capture form; sign in
at `/login`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run seed` | Seed demo data |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Jest unit + component tests |
| `npm run test:e2e` | Playwright smoke tests (needs a running, seeded app) |
| `npm run format` | Prettier write |

## API reference

All responses use `{ data }` (or `{ data, meta }` for lists). Errors use
`{ error: { code, message, details? } }`. Inputs are Zod-validated.

| Method | Route | Access | Notes |
| --- | --- | --- | --- |
| POST | `/api/leads` | public / auth | unauth = capture; auth = create (MEMBER self-assigned) |
| GET | `/api/leads` | auth | scoped list: `page,limit,q,status,tag,source,assignedTo,sort` |
| GET | `/api/leads/:id` | auth | scoped fetch |
| PUT | `/api/leads/:id` | auth | update; status transitions + RBAC enforced |
| DELETE | `/api/leads/:id` | admin | soft delete |
| POST | `/api/leads/:id/notes` | auth | add note |
| GET | `/api/users` | admin | list users |
| POST | `/api/users` | admin | create user |
| PUT | `/api/users/:id` | admin | update name / role / password |
| DELETE | `/api/users/:id` | admin | delete (guards self + last admin) |
| PUT | `/api/profile` | auth | self name / password |
| GET | `/api/dashboard/stats` | auth | scoped metrics |
| * | `/api/auth/*` | — | Auth.js handlers (session, signin, signout) |

## RBAC model

| Capability | ADMIN | MEMBER |
| --- | --- | --- |
| See all leads | ✓ | own only |
| Create lead | ✓ | ✓ (auto-assigned to self) |
| Change status | ✓ | ✓ (status only) |
| Reassign / edit other fields | ✓ | ✗ |
| Delete lead | ✓ (soft) | ✗ |
| Add notes | ✓ | ✓ (own leads) |
| Manage users | ✓ | ✗ |
| Dashboard scope | team-wide | own leads |

Illegal status moves (e.g. New → Won) return HTTP 409.

## Testing

```bash
npm run test        # Jest: transitions, validation, formatting, component render
npm run test:e2e    # Playwright: auth redirect + admin sign-in smoke
```

## Deployment (Netlify + Atlas)

1. Push to a Git repo and create a new Netlify site from it.
2. `netlify.toml` already configures the build and the official
   `@netlify/plugin-nextjs` adapter (SSR, API routes, middleware).
3. Set environment variables in Netlify: `MONGODB_URI`, `AUTH_SECRET`, and
   `AUTH_URL` (your site URL). `trustHost` is enabled for non-Vercel hosts.
4. In Atlas, allow Netlify egress (or `0.0.0.0/0` for a quick start) and create a
   database user. Run the seed once against the production URI if desired.

## Notes

- `npm run build` self-hosts Google Fonts via `next/font`, which fetches them at
  build time, and requires the `MONGODB_URI`. Both need normal network access.
- Profile name changes appear after the next sign-in, since the display name is
  carried in the JWT session.
