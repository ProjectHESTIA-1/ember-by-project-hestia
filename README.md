# Ember

**Your Community, Connected.**

Ember is a hyperlocal community discovery and participation platform. It connects residents,
local businesses, nonprofits, schools, churches, libraries, and community organizations through
shared digital infrastructure: local discovery, community initiatives, fundraising campaigns,
applications and competitions, events, and volunteer opportunities.

Ember is built to serve many communities from one deployment. The first deployment targets a
single neighborhood; nothing in the codebase is tied to a specific place.

> **Status:** pre-MVP. Phase 0.5 (project scaffolding and governance) is complete.
> See [docs/audit/PHASE_0_REPOSITORY_AUDIT.md](docs/audit/PHASE_0_REPOSITORY_AUDIT.md) for the
> development plan and approval gates.

## Stack

Next.js (App Router) · TypeScript (strict) · Supabase (Postgres, Auth, Storage) · Zod ·
Vitest · Playwright · pnpm. Payments (Stripe hosted Checkout) arrive in Phase 5 after a
separate approval. Rationale: [docs/adr/0001-stack.md](docs/adr/0001-stack.md).

## Getting started

Prerequisites: Node 22 (`.nvmrc`), [pnpm](https://pnpm.io) 10, Docker (for local Supabase).

```bash
pnpm install
cp .env.example .env.local
pnpm db:start          # starts local Supabase; prints the anon and service-role keys
# paste the printed keys into .env.local
pnpm dev               # http://localhost:3000
```

Local Supabase Studio runs at http://127.0.0.1:54323 and the local email inbox (for
verification and reset emails) at http://127.0.0.1:54324.

## Scripts

| Command             | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `pnpm dev`          | Development server                                                  |
| `pnpm check`        | Lint, typecheck, format check, client-secret scan, unit tests       |
| `pnpm test`         | Unit tests (Vitest)                                                 |
| `pnpm test:e2e`     | End-to-end tests (Playwright; builds and starts the app itself)     |
| `pnpm test:rls`     | Database and Row-Level Security tests against local Supabase        |
| `pnpm db:reset`     | Recreate the local database from migrations and `supabase/seed.sql` |
| `pnpm db:migration` | Create a new migration file                                         |
| `pnpm db:types`     | Regenerate TypeScript types from the local schema                   |

## Documentation

| Document                                                       | Contents                                     |
| -------------------------------------------------------------- | -------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                   | System shape, module layout, data flow       |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)             | Tables, relationships, indexes               |
| [docs/SECURITY.md](docs/SECURITY.md)                           | Security requirements and controls           |
| [docs/AUTHORIZATION.md](docs/AUTHORIZATION.md)                 | Roles, permissions, RLS, service-role policy |
| [docs/PAYMENT_ARCHITECTURE.md](docs/PAYMENT_ARCHITECTURE.md)   | Donation flow (proposal; pending approval)   |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)         | Server actions and route handlers            |
| [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)               | Step-by-step hosted Supabase setup checklist |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                       | Environments, releases, backups              |
| [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | Every variable, its scope, and who owns it   |
| [docs/TESTING.md](docs/TESTING.md)                             | Test layers and how to run them              |
| [docs/adr/](docs/adr/)                                         | Architecture decision records                |
| [CONTRIBUTING.md](CONTRIBUTING.md)                             | How to contribute; protected areas           |
| [SECURITY.md](SECURITY.md)                                     | Reporting a vulnerability                    |

## Organizations

Ember (the platform) and Project HESTIA (a nonprofit that runs community programs) are separate
organizations. Project HESTIA is one customer of Ember; the platform serves independent
organizations and is not hardcoded to any of them.

## License

See [LICENSE](LICENSE).
