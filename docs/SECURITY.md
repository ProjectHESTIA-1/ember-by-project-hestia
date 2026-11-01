# Security Requirements and Controls

_Last updated: Phase 0.5. "Status" tracks what is implemented; requirements come from §6 of the
MVP plan. To report a vulnerability see [../SECURITY.md](../SECURITY.md)._

## Authentication (Supabase Auth)

| Requirement                     | Control                                                    | Status  |
| ------------------------------- | ---------------------------------------------------------- | ------- |
| No plaintext passwords          | Supabase Auth (bcrypt)                                     | config  |
| Minimum password strength       | 12+ chars, letters and digits (`supabase/config.toml`)     | config  |
| Verified email before sign-in   | `enable_confirmations = true`                              | config  |
| Secure password change          | `secure_password_change = true` (recent re-auth required)  | config  |
| Refresh token rotation          | enabled                                                    | config  |
| Rate limiting on auth endpoints | Supabase Auth built-in limits (`[auth.rate_limit]`)        | config  |
| MFA for administrators          | TOTP enrollment enabled; enforcement for `platform_admins` | Phase 1 |
| Session refresh                 | `src/proxy.ts` refreshes cookies per request               | Phase 1 |
| Account suspension              | `profiles.suspended_at` checked in session helper + RLS    | Phase 1 |

## Authorization

Two layers, always both: service-layer policy functions and Row-Level Security.
See [AUTHORIZATION.md](AUTHORIZATION.md).

## Secrets

| Control                                                                            | Status                             |
| ---------------------------------------------------------------------------------- | ---------------------------------- |
| Service-role key read only in `src/lib/env/server.ts`, which is `server-only`      | done                               |
| Admin client import allow-list enforced by `scripts/check-client-secrets.sh` in CI | done                               |
| No secret-looking `NEXT_PUBLIC_*` names (CI check)                                 | done                               |
| `.env*` ignored by git; `.env.example` holds placeholders only                     | done                               |
| Contributors never receive production secrets                                      | policy                             |
| GitHub secret scanning + push protection                                           | **human: enable in repo settings** |

## API and input handling

| Requirement                | Control                                                           | Status    |
| -------------------------- | ----------------------------------------------------------------- | --------- |
| Input validation           | Zod schema per action; unknown keys rejected (no mass assignment) | pattern   |
| SQL injection              | Parameterized queries via supabase-js / Postgres functions        | pattern   |
| XSS                        | React escaping; no `dangerouslySetInnerHTML` without sanitizer    | pattern   |
| CSRF                       | Server Actions origin check (Next.js built-in); SameSite cookies  | framework |
| Secure headers             | CSP, HSTS, X-Frame-Options, Referrer-Policy via `next.config.ts`  | Phase 1   |
| Rate limiting (app writes) | Shared store (decision D7)                                        | Phase 2+  |
| File uploads               | Private buckets, MIME + size limits (10 MiB local), signed URLs   | Phase 4   |

## Payments (Phase 5, pending approval)

Hosted checkout only; no card data touches Ember. Webhook signatures verified; handlers
idempotent on provider event ID; totals computed from confirmed events only; refunds and
failures recorded. See [PAYMENT_ARCHITECTURE.md](PAYMENT_ARCHITECTURE.md).

## Student and minor privacy

- Collect the minimum. No public student directories. No student contact details exposed.
- Applications visible only to the applicant, their linked guardian, assigned reviewers, and
  the owning organization's admins. Judges never see donor data.
- Guardian consent recorded before a minor's application is accepted (design pending D5).
- Retention and deletion policy: `DATA_RETENTION.md` (to be written in Phase 4 with human input).
- **Legal review required** for COPPA, FERPA, and state student-privacy laws. Technical
  safeguards do not constitute compliance.

## Administrative security

Every privileged action writes `audit_logs` (actor, action, target, before/after, IP).
Permission changes are audited. Financial rows cannot be silently modified (trigger +
no-update policies).

## Caching

Server caching is opt-in (`"use cache"`). Private data never opts in. Private responses send
`Cache-Control: private, no-store`.
