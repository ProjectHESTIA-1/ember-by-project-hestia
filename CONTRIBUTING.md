# Contributing to Ember

Thanks for helping build Ember. This document explains how changes get in and which parts of
the codebase need extra review.

> The repository is currently **private**. These rules apply to internal contributors now and
> will apply to outside contributors when the open-core split (see
> [docs/adr/0001-stack.md](docs/adr/0001-stack.md), decision D2) is finalized.

## Workflow

1. Create a branch from `main`. Direct pushes to `main` are blocked.
2. Keep changes small and focused. One concern per pull request.
3. Run `pnpm check` before pushing. CI runs the same checks plus build, E2E, and RLS tests.
4. Open a pull request using the template. Fill in **every** section, including "None".
5. At least one approving review is required. Changes to protected areas also require a review
   from the code owner (see `.github/CODEOWNERS`).
6. Squash-merge. The PR title becomes the commit subject.

## Protected areas

These need a core-maintainer review and, for anything beyond a bug fix, prior discussion in an
issue. They map to §8 of the MVP plan.

| Area                                        | Paths                                             |
| ------------------------------------------- | ------------------------------------------------- |
| Authentication and sessions                 | `src/lib/auth/`, `src/proxy.ts`                   |
| Authorization and Row-Level Security        | `supabase/migrations/`, `src/modules/*/policy.ts` |
| Supabase clients and environment handling   | `src/lib/supabase/`, `src/lib/env/`               |
| Payments, donations, financial calculations | `src/modules/donations/`, `src/app/api/webhooks/` |
| Infrastructure and CI                       | `.github/`, `next.config.ts`, `scripts/`          |
| Data retention and student-privacy policy   | `docs/SECURITY.md`, `docs/DATA_RETENTION.md`      |

## Contributor-friendly areas

Discovery UI, organization and business dashboards, campaign and event pages, application
forms, search and filtering, documentation, and tests. Pull requests here still need a review
but do not need an upfront design discussion.

## Code conventions

- TypeScript `strict`. No `any` without a comment explaining why.
- Business logic lives in `src/modules/<domain>/service.ts`, not in React components or route
  handlers. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Every external input is parsed with a Zod schema that rejects unknown keys.
- Authorization is checked in the service layer **and** enforced by RLS. Never rely on the UI.
- Never import `@/lib/supabase/admin` outside the allow-list in
  [docs/AUTHORIZATION.md](docs/AUTHORIZATION.md). CI fails otherwise.
- Formatting is Prettier's job. Run `pnpm format`.

## Tests

A feature is not done until it has tests. See [docs/TESTING.md](docs/TESTING.md) for which
layer to use. Policy changes require an RLS test exercising at least two different users.

## Commit messages

Imperative mood, under 72 characters for the subject, body explains _why_. Do not include
model identifiers or tool names.

## Secrets

Never commit `.env.local` or any credential. Contributors do not receive production secrets.
If you believe a secret has been exposed, follow [SECURITY.md](SECURITY.md) immediately.
