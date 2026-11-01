# Testing

A feature is complete only when its acceptance criteria (MVP plan §10) are covered by tests
that pass in CI.

## Layers

| Layer      | Tool                               | Location               | Run with        | What it covers                                                        |
| ---------- | ---------------------------------- | ---------------------- | --------------- | --------------------------------------------------------------------- |
| Unit       | Vitest                             | `src/**/*.test.ts`     | `pnpm test`     | Schemas, policy functions, services with mocked queries, pure helpers |
| RLS / DB   | pgTAP via Supabase CLI             | `supabase/tests/*.sql` | `pnpm test:rls` | Every RLS policy, DB functions, constraints, triggers                 |
| End-to-end | Playwright                         | `e2e/*.spec.ts`        | `pnpm test:e2e` | User flows across the real app, including cross-tenant denials        |
| Static     | ESLint, tsc, Prettier, secret scan | —                      | `pnpm check`    | Types, lint, formatting, client-side secret exposure                  |

## Rules

- **Policy change → RLS test.** Run as at least two distinct users; assert allowed and denied.
- **New input → schema test** with at least one rejected unknown key.
- **New privileged path → audit test** asserting an `audit_logs` row.
- **Payments (Phase 5):** webhook signature failure, duplicate event, refund, failed payment.
- Tests use fictional data only. Never copy production records into fixtures.
- Do not skip, quarantine, or weaken a test to get CI green.

## Running locally

```bash
pnpm check                 # fast feedback
pnpm db:start && pnpm test:rls
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium pnpm test:e2e   # optional override for a preinstalled browser
```

`pnpm test:e2e` builds and starts the app itself. Set `PLAYWRIGHT_BASE_URL` to target an
already-running server instead.

## Coverage

Unit coverage is reported for `src/lib` and `src/modules` and uploaded as a CI artifact. There
is no hard threshold yet; one will be set after Phase 1 based on the real baseline.
