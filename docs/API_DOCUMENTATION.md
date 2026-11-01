# API Documentation

_Last updated: Phase 0.5._

Ember exposes functionality primarily through **Next.js Server Actions** (for the app's own
UI) and a small number of **Route Handlers** (for webhooks, health checks, and QR redirects).
There is no public REST API in V1.

## Route handlers

| Method | Path          | Auth | Purpose                                 | Cache      |
| ------ | ------------- | ---- | --------------------------------------- | ---------- |
| GET    | `/api/health` | none | Liveness probe; returns `{status:"ok"}` | `no-store` |

Planned: `POST /api/webhooks/stripe` (Phase 5, signature-verified), `GET /r/:code`
(Phase 5, QR referral redirect), `GET /a/:token` (Phase 6, attendance check-in).

## Server actions

Documented per module as each lands, in the form:

```
module.action(input: Schema) → Result<Output, ErrorCode>
  who: <roles>
  side effects: <tables written, audit entry?>
```

## Conventions

- Every action parses its input with Zod (`src/modules/<domain>/schema.ts`).
- Actions return typed results, never throw raw database errors to the client.
- Error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION`, `CONFLICT`,
  `RATE_LIMITED`, `INTERNAL`.
- Lists are paginated (cursor-based) with a maximum page size of 50.
