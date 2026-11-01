# ADR 0001: Stack and modular monolith

**Status:** Accepted (decision D1, 2026-11-01)

## Context

The repository was empty at audit time. The MVP plan proposes Next.js, TypeScript, Supabase,
Stripe hosted checkout, and Vercel, and requires a modular architecture without premature
distributed infrastructure.

## Decision

- Next.js 16 (App Router, Cache Components enabled) with TypeScript `strict`.
- Supabase for Postgres, Auth, and Storage; Supabase CLI for local development and migrations.
- Zod for all external input validation.
- Vitest (unit), pgTAP via Supabase CLI (RLS), Playwright (E2E).
- pnpm; Node 22.
- One application, one database, modules organized by domain under `src/modules`.
- Payments via Stripe hosted Checkout, **deferred to Phase 5 behind a separate approval**.

## Consequences

- No ORM: schema and RLS live in SQL migrations, which keeps policies reviewable and testable.
  Multi-row operations use Postgres functions.
- Cache Components mean server caching is opt-in, which makes "never cache private data" the
  default rather than a discipline.
- Next.js 16 differs from older versions (e.g. `proxy.ts` replaces `middleware.ts`); consult
  `node_modules/next/dist/docs` rather than memory.
- Repository licensing/ownership (decision D2) remains open; the repo is private for now and
  `LICENSE` is unchanged.
