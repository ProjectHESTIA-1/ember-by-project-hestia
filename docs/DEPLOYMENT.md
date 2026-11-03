# Deployment

_Last updated: Phase 0.5. No hosted environments exist yet (decision D9: a human creates them)._

## Environments

To create the Supabase projects, follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

| Environment | Next.js        | Supabase project      | Branch / trigger   | Who deploys        |
| ----------- | -------------- | --------------------- | ------------------ | ------------------ |
| Local       | `pnpm dev`     | Supabase CLI (Docker) | —                  | developer          |
| Preview     | Vercel preview | **staging**           | every pull request | automatic          |
| Staging     | Vercel         | staging               | merge to `main`    | automatic          |
| Production  | Vercel         | production            | manual promotion   | **human approval** |

Preview deployments must never point at the production Supabase project.

## Release checklist (production)

1. Staging has run the full suite green (CI + manual smoke of the changed flows).
2. Migrations reviewed; `supabase db push` dry-run output attached to the release PR.
3. Backups: confirm the most recent automated backup and that a restore was tested within the
   last quarter (document the date here).
4. Human approval recorded on the release PR.
5. Promote in Vercel; run migrations; verify `/api/health` and one authenticated flow.
6. Monitor error tracking and webhook failure dashboards for 30 minutes.

## Backups and restore

Supabase daily backups (plan-dependent; PITR recommended for production once donations go
live). Restore procedure and last drill date to be documented before Phase 7 release.

## Monitoring

Structured JSON logs from the app; error tracking provider TBD (to be chosen before Phase 2);
Vercel and Supabase health dashboards; alerts on webhook handler failures (Phase 5).

## Branch protection (`main`)

Enabled (decision D3). Required: pull request, ≥1 approval, code-owner review for protected
paths, status checks `checks`, `build-and-e2e`, and (once present) `rls-tests`; no force
pushes; no deletions.
