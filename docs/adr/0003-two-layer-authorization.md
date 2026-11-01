# ADR 0003: Two-layer authorization and service-role policy

**Status:** Accepted (2026-11-01)

## Context

The plan requires server-side authorization, RLS on every exposed table, and that the
service-role key never reaches the browser. A single layer leaves one bug between a user and
another tenant's data.

## Decision

1. Every mutation passes a `policy.ts` check in the service layer **and** is executed with the
   user-scoped Supabase client so RLS applies.
2. RLS is enabled on every `public` table at creation; tables start with no policies (deny all).
3. The service-role client is importable only from an allow-list recorded in
   `docs/AUTHORIZATION.md`; `scripts/check-client-secrets.sh` enforces it in CI, along with a
   ban on secret-looking `NEXT_PUBLIC_*` names and on client modules importing server-only code.
4. Server secrets are read in exactly one `server-only` module and re-exported under neutral
   names, so the raw variable name appears nowhere else in `src/`.

## Consequences

- Slight duplication between policy functions and SQL policies, accepted for defense in depth.
  pgTAP tests keep the SQL side honest; unit tests keep the TypeScript side honest.
- Adding a privileged path is a visible, reviewed change (allow-list + CODEOWNERS).
- Unit tests alias `server-only` to a stub (`src/test/server-only-stub.ts`); the real guard
  still runs in the Next.js build.
