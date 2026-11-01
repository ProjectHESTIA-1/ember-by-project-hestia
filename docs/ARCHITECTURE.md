# Architecture

_Last updated: Phase 0.5. This document is updated at the end of each phase._

## Shape

Ember is a **modular monolith**: one Next.js application and one Postgres database serving
every community. There are no microservices and no per-community deployments.

```
Browser ──► Next.js (Vercel)
              ├─ Server Components / Server Actions / Route Handlers
              │     └─ src/modules/<domain>/service.ts   (business rules + authorization)
              │           └─ src/modules/<domain>/queries.ts
              │                 └─ Supabase client (user session → RLS applies)
              └─ Audited server-only paths (webhooks, admin jobs)
                    └─ Supabase admin client (service role → RLS bypassed, every write audited)

Supabase: Postgres (+ RLS, functions), Auth, Storage (private buckets)
Stripe (Phase 5): hosted Checkout + signed webhooks
```

## Repository layout

```
src/
  app/                      Next.js routes. Thin: render, call a service, return.
    api/health/             Liveness probe
  modules/                  One folder per domain (added from Phase 1)
    <domain>/
      schema.ts             Zod input/output schemas
      policy.ts             can(actor, action, resource) → boolean
      service.ts            business logic; calls policy before queries
      queries.ts            database access only
      *.test.ts
  lib/
    env/                    Validated environment (public.ts is browser-safe, server.ts is not)
    supabase/               server.ts (user-scoped), admin.ts (service role), client.ts (browser)
    auth/                   Session helpers (Phase 1)
  test/                     Test-only shims
supabase/
  config.toml               Local Supabase configuration
  migrations/               Versioned SQL; schema, RLS policies, functions. Source of truth.
  tests/                    pgTAP policy tests run by `supabase test db`
  seed.sql                  Fictional local data
e2e/                        Playwright tests
scripts/                    CI guard scripts
docs/                       Project documentation and ADRs
```

## Request flow for a mutation

1. A Server Action or Route Handler receives input.
2. Input is parsed with the module's Zod schema (unknown keys rejected).
3. The current user is read from the session (`src/lib/auth`, Phase 1).
4. `service.ts` calls `policy.ts`. Denied → typed error, no database call.
5. `queries.ts` runs the query with the **user-scoped** client. RLS enforces the same rule
   again at the database.
6. Multi-row operations call a Postgres function (transactional, defined in a migration).
7. Sensitive administrative actions write an `audit_logs` row in the same transaction.

## Caching

Next.js 16 Cache Components are enabled: **nothing is cached on the server unless a function
opts in with `"use cache"`.** Only public, non-personal data (community pages, public campaign
pages, org/business profiles) may opt in. Anything derived from the session or involving
applications, donations, or minors is never cached on the server.

## Multi-community model

`communities` is a first-class table. Every content row (organization, business, initiative,
campaign, event) carries a `community_id`. Users join communities through
`community_members`. Discovery queries always filter by community. There is no "default"
community in code; the initial community is seed data.

## Deferred on purpose

Recommendation engine, messaging, loyalty/rewards, advanced analytics, PostGIS, Redis,
queues, microservices. Each is added only when a concrete need appears, via an ADR.

## Decisions

See [adr/](adr/).
