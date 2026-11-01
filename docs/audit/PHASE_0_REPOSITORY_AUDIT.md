# Ember V1 — Phase 0 Repository Audit Report

|                    |                                                    |
| ------------------ | -------------------------------------------------- |
| **Date**           | 2026-11-01                                         |
| **Repository**     | `projecthestia-1/ember-by-project-hestia`          |
| **Commit audited** | `5ad8bfd` ("Initial commit", `main`)               |
| **Phase**          | 0 — Repository Audit (no application code written) |
| **Status**         | Awaiting human approval before Phase 1             |

---

## 1. Executive summary

The repository is **greenfield**. It contains no application code, no dependencies,
no database schema, no API routes, no authentication, no tests, and no CI.

Because nothing exists, there is **no working functionality to preserve and nothing to
rewrite**. The proposed stack in the MVP plan (Next.js + TypeScript + Supabase + Stripe
hosted checkout + Vercel) conflicts with no existing infrastructure, so adopting it is
not a "replacement". It still needs explicit approval under §4 of the plan.

The main findings are about **governance and organizational separation**, not code:

1. `main` has **no branch protection**. Anyone with write access can push to it directly.
2. The repository lives under the **Project HESTIA GitHub organization**, and the
   LICENSE copyright holder is **Project HESTIA**. The plan says Ember (the for-profit
   company) controls the repository and should stay separate from HESTIA.
3. The repo is **MIT-licensed in full**, which doesn't match an **open-core** model where
   some modules stay under Ember's control.

None of these can be fixed in code. They need decisions from people (see §8).

---

## 2. What already exists

| Path         | Contents                                               | Assessment                                                                                                                  |
| ------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `README.md`  | 2 lines: title + "Project Hestia Ember app repository" | Placeholder. Needs a full rewrite in Phase 0.5.                                                                             |
| `LICENSE`    | MIT, "Copyright (c) 2026 Project HESTIA"               | Legally meaningful. See §6.2. **Do not change without approval.**                                                           |
| `.gitignore` | GitHub's standard Node template                        | Good. Already covers `.env`, `.env.*` (with an exception for `.env.example`), `.next`, `node_modules`, and coverage output. |

**Git history:** one commit (`5ad8bfd`, 2026-11-01).
**Branches:** `main` (unprotected) and `claude/ember-v1-mvp-plan-kzo1o2` (this audit).
**GitHub:** 0 issues, 0 pull requests, no Actions workflows, no CODEOWNERS, no PR template.

### Dev environment available to the agent

Node 22, npm 10, pnpm 10, PostgreSQL 16 client, Docker 29. The Supabase CLI isn't
installed. It can be added as a project dev-dependency so local Supabase (Postgres +
Auth + Storage in Docker) can run real RLS tests.

---

## 3. Answers to the eight audit questions

| #   | Question                  | Answer                                                                                                                                  |
| --- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What already exists?      | README stub, MIT LICENSE, Node `.gitignore`. Nothing else.                                                                              |
| 2   | What works?               | No application functionality exists yet. The `.gitignore` is correct and protects `.env` files.                                         |
| 3   | What is incomplete?       | Everything in Modules A–I. All 11 required docs (§11 of the plan). All governance controls (§8).                                        |
| 4   | What needs fixing?        | Branch protection on `main`. Repo ownership and LICENSE vs. the Ember/HESTIA separation and the open-core model (needs a decision, §8). |
| 5   | What needs building?      | The full MVP. Recommended order is in §7.                                                                                               |
| 6   | Security weaknesses?      | See §6. No code-level weaknesses yet (no code). The weaknesses are governance-level.                                                    |
| 7   | Recommended architecture? | See §5.                                                                                                                                 |
| 8   | Recommended sequence?     | See §7.                                                                                                                                 |

---

## 4. Database structure (current)

**None.** No schema, migrations, ORM config, or Supabase project config exist in the repo.

---

## 5. Recommended architecture

### 5.1 Stack — adopt the plan's proposed stack as-is

| Layer               | Choice                                                                        | Notes                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Framework           | Next.js (App Router) + React                                                  | Server Components and Route Handlers / Server Actions keep data access server-side.                                      |
| Language            | TypeScript, `strict: true`                                                    |                                                                                                                          |
| Package manager     | pnpm                                                                          | Fast and strict. Lockfile committed.                                                                                     |
| DB / Auth / Storage | Supabase (Postgres, Supabase Auth, Supabase Storage)                          |                                                                                                                          |
| Validation          | Zod                                                                           | One schema per input, shared by server actions and route handlers. Rejects unknown keys, which prevents mass assignment. |
| Payments            | Stripe hosted Checkout                                                        | **Phase 5 only, after approval.**                                                                                        |
| Maps                | Deferred to Phase 2 (Mapbox recommended)                                      | Store lat/lng from Phase 1 so maps are additive.                                                                         |
| Testing             | Vitest (unit/integration), Playwright (E2E), RLS tests against local Supabase |                                                                                                                          |
| Hosting             | Vercel + separate Supabase projects for staging and production                |                                                                                                                          |
| CI                  | GitHub Actions: lint, typecheck, unit tests, RLS tests, build                 | Required status checks on `main`.                                                                                        |

### 5.2 Shape: modular monolith

```
src/
  app/                    # Next.js routes (UI + route handlers). Thin; no business logic.
  modules/
    communities/          # one folder per domain module
      schema.ts           #   Zod input/output schemas
      service.ts          #   business logic (authorization checks live here)
      queries.ts          #   database access
      policy.ts           #   "can actor X do Y to resource Z" functions
      *.test.ts
    organizations/  businesses/  initiatives/  campaigns/
    applications/  events/  volunteers/  donations/ (Phase 5)
  lib/
    supabase/server.ts    # per-request client using the user's session (RLS applies)
    supabase/admin.ts     # service-role client — server-only, `import "server-only"`
    auth/  logging/  rate-limit/  audit/
supabase/
  migrations/             # versioned SQL migrations (source of truth for schema + RLS)
  tests/                  # RLS policy tests run against local Supabase
  seed.sql                # dev-only seed data (fake data only)
docs/                     # the 11 required docs + decision records (docs/adr/)
```

This layout also supports the open-core governance split. Protected paths
(`supabase/migrations`, `src/lib/auth`, `src/lib/supabase`, `src/modules/donations`,
`.github/`) can be assigned to core maintainers in `CODEOWNERS`. UI and discovery modules
stay open to contributors.

### 5.3 Authorization model: two layers

1. **Application layer.** Every mutation goes through a `service.ts` function that calls
   a `policy.ts` check against the authenticated user from the server session. Frontend
   role checks only decide what to show. They never decide what's allowed.
2. **Database layer (RLS).** RLS is enabled on every table in the `public` schema, with
   policies that mirror the application rules. If the app layer has a bug, RLS still
   blocks it.

The **service-role key** is used only in a small number of audited server-only code
paths (for example, the Stripe webhook handler and admin jobs). The `server-only`
import guard and a CI grep check keep it out of client bundles.

### 5.4 Roles are scoped memberships, not global flags

The plan lists six roles. They work best as **relationships**, not a single
`users.role` column, because the plan requires users to "hold different roles within
different organizations."

| Plan role                  | Recommended model                                                            |
| -------------------------- | ---------------------------------------------------------------------------- |
| Resident                   | `community_members` row (role: `member` / `moderator` / `admin`)             |
| Student / Applicant        | Anyone who submits an `applications` row. Age/minor status on the profile.   |
| Parent / Guardian          | `guardian_links` (guardian ↔ minor) + `guardian_consents`                    |
| Organization Administrator | `organization_members` row (role: `owner` / `admin` / `editor` / `reviewer`) |
| Business Administrator     | `business_members` row (role: `owner` / `admin` / `editor`)                  |
| Platform Administrator     | `platform_admins` table. A small set, MFA required, every action audited.    |
| Judge / Reviewer (§6)      | `application_reviewers` assignment per opportunity or per application        |

### 5.5 Gaps in the planned table list

These tables aren't in the plan's §5 list, but the plan's own requirements imply them.
I'm flagging them here instead of adding them silently:

| Table                                 | Required by                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `profiles` (instead of `users`)       | Supabase Auth owns `auth.users`. App data goes in `public.profiles`, keyed by the same UUID.    |
| `business_members`                    | "Business administrators cannot access other businesses' records"                               |
| `platform_admins`                     | Restricted, auditable admin privileges                                                          |
| `opportunities`                       | Applications need something to apply _to_ (competitions, scholarships)                          |
| `application_reviewers`               | "Reviewers should only access assigned applications"                                            |
| `guardian_links`, `guardian_consents` | Parental consent for minors                                                                     |
| `fund_recipients`                     | "Every campaign must identify its authorized fund recipient" _(Phase 5 design, needs approval)_ |
| `payment_webhook_events`              | Idempotent webhook handling (unique on Stripe event ID) _(Phase 5)_                             |
| `referral_scans`                      | Separates scan events from `campaign_referrals` (the QR codes themselves)                       |
| `volunteer_signups`                   | Residents signing up for `volunteer_opportunities`                                              |

### 5.6 Transactions

`supabase-js` can't run multi-statement transactions from the client. Multi-record
operations (for example, capacity-checked event registration or campaign approval with
an audit log entry) should be **Postgres functions** defined in migrations and called via
RPC. This keeps the logic transactional, version-controlled, and covered by RLS tests,
and it avoids adding an ORM, in line with the plan's "avoid unnecessary database
abstraction layers."

---

## 6. Security weaknesses and risks

### 6.1 Present now

| #   | Severity | Finding                                                                            | Recommendation                                                                                                                                                                |
| --- | -------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | **High** | `main` is unprotected. Direct pushes, force pushes, and deletion are all possible. | Enable branch protection or a ruleset: require PRs, ≥1 approving review, required status checks, no force push, no deletion. Must be done by a repo admin in GitHub settings. |
| S2  | Medium   | No `CODEOWNERS`, so protected areas (§8 of the plan) have no enforced reviewers.   | Add `CODEOWNERS` in Phase 0.5. Enable "Require review from Code Owners".                                                                                                      |
| S3  | Medium   | No CI, so nothing checks a PR before merge.                                        | Add a GitHub Actions workflow in Phase 0.5.                                                                                                                                   |
| S4  | Medium   | No `SECURITY.md` or vulnerability-disclosure process for an open-core repo.        | Add one in Phase 0.5. A disclosure contact address is needed from you.                                                                                                        |
| S5  | Low      | Secret scanning and push protection status unknown.                                | Enable GitHub secret scanning + push protection (free for public repos). Add Dependabot.                                                                                      |

### 6.2 Governance and organizational separation (needs decisions)

| #   | Finding                                                         | Why it matters                                                                                                                                                                                                                                                                                                             |
| --- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | The repo is owned by the `projecthestia-1` org (the nonprofit). | The plan says "Ember controls the repository" and requires clear separation between HESTIA and Ember. A for-profit's core IP living in the nonprofit's account can blur that line, including for IP ownership and charitable-asset rules. **Talk to counsel.**                                                             |
| G2  | LICENSE copyright holder is "Project HESTIA".                   | Same issue: who owns Ember's code?                                                                                                                                                                                                                                                                                         |
| G3  | The whole repo is MIT.                                          | MIT lets anyone use, fork, and commercialize **all** code, including payments and auth. "Open-core" usually means an open core plus separately licensed or private modules. Decide what's open and what isn't **before** contributors start submitting code. A CLA or DCO may also be needed so Ember can relicense later. |

### 6.3 Design-time risks to build in from Phase 1

- **Minors' data (COPPA/FERPA/state laws).** I can build technical safeguards. I can't
  decide legal compliance. **Needs human/legal review** (see D5).
- **Service-role key leakage.** Mitigated by `server-only` imports, a CI check, and
  keeping the key out of any `NEXT_PUBLIC_*` variable.
- **Rate limiting on serverless.** In-memory limits don't work on Vercel. Supabase Auth
  has built-in auth rate limits. App-level limits need a shared store (Upstash Redis is
  common), which is a new dependency (see D7).
- **Caching private data.** Next.js can cache aggressively. Private routes will be
  explicitly dynamic, with `Cache-Control: private, no-store`. Only public pages are cached.
- **QR attendance tokens.** Use high-entropy random tokens (≥128 bits) stored hashed, or
  HMAC-signed tokens with expiry. Never use sequential IDs.

---

## 7. Recommended development sequence

Each step is one or a few small, reviewable PRs into `main`. Phases follow the plan's
order. I've added a **Phase 0.5** because the plan's governance controls (CI, CODEOWNERS,
docs) have to exist before feature code arrives.

### Phase 0.5 — Scaffolding and governance (no product features)

1. Scaffold Next.js + TypeScript (strict) + pnpm + ESLint + Prettier.
2. Vitest and Playwright harness, plus one smoke test each.
3. Local Supabase via the Supabase CLI (dev dependency) and an empty migrations folder.
4. GitHub Actions CI: lint, typecheck, test, build. Dependabot.
5. `CODEOWNERS`, PR template, `CONTRIBUTING.md`, `SECURITY.md`, `ENVIRONMENT_VARIABLES.md`, `.env.example`.
6. Skeletons of the remaining required docs plus `docs/adr/` (architecture decision records).

### Phase 1 — Foundation _(protected areas: authorization, RLS, migrations → your review)_

1. Migration: `profiles`, `communities`, `community_members`, `platform_admins`, `audit_logs`, plus RLS and RLS tests.
2. Auth flows: sign up, email verification, login/logout, password reset, session refresh via middleware, account suspension.
3. Migration + module: `organizations`, `organization_members`, plus RLS and tests.
4. Migration + module: `businesses`, `business_members`, plus RLS and tests.
5. Platform admin basics: verify orgs and businesses, suspend users, view the audit log. MFA required.

### Phase 2 — Discovery

Community feed, search (Postgres full-text search), filters, sorting, pagination, and
org/business/initiative/campaign profile pages. Map last, if feasible.

### Phase 3 — Initiatives and campaigns

Initiative and campaign CRUD, a status state machine (draft → pending approval → active
→ paused / completed / cancelled) enforced in a DB function, the approval workflow, and
public campaign pages. **No donation button** until Phase 5.

### Phase 4 — Applications

`opportunities`, the application form, private Storage bucket uploads (type and size
limits, signed URLs), application status, reviewer assignment and dashboard, and the
guardian consent flow (design subject to D5).

### Phase 5 — Fundraising _(blocked until payment architecture is approved)_

I'll write `PAYMENT_ARCHITECTURE.md` as a proposal first. No payment code until you
sign off and legal/accounting review is done.

### Phase 6 — Events and volunteers

Events, registration with transactional capacity checks, volunteer listings and sign-ups,
QR attendance tokens, and organizer exports.

### Phase 7 — Testing and release

Full test pass, accessibility review, performance checks, backup and restore drill,
then deploy to staging. Production only with your approval.

---

## 8. Decisions requiring human approval

I need answers to **D1–D4** before I start Phase 0.5/1. **D5–D10** can be answered
during Phase 1, before the relevant work.

| #      | Decision                                                                                                                                                                                                   | My recommendation                                                                                                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **D1** | Approve the proposed stack (§5.1) and modular-monolith layout (§5.2)?                                                                                                                                      | Approve.                                                                                                                                                                       |
| **D2** | Repo ownership and licensing (G1–G3): Should Ember's repo move to an Ember-controlled GitHub org? Who is the copyright holder? Which parts are open-source vs. proprietary? Will you require a CLA or DCO? | Resolve with counsel **before** accepting outside contributions. I can keep working meanwhile, but I won't edit `LICENSE`.                                                     |
| **D3** | Enable branch protection on `main` (S1)?                                                                                                                                                                   | Yes, now. It has to be done by a repo admin in GitHub settings. I can't do it from here.                                                                                       |
| **D4** | Approve the scoped-membership role model (§5.4) and the added tables (§5.5)?                                                                                                                               | Approve.                                                                                                                                                                       |
| D5     | Minimum age and minors: Will V1 allow under-13 accounts? How does guardian consent work for 13–17-year-olds?                                                                                               | Recommend V1 **does not allow under-13 accounts**, and that guardian consent is recorded for minors applying to opportunities. **Needs legal review (COPPA/FERPA/state law).** |
| D6     | Which community is the initial deployment? (name, boundary)                                                                                                                                                | Needed only for seed and staging data. Nothing will be hardcoded.                                                                                                              |
| D7     | Rate-limiting store (new dependency, e.g. Upstash Redis)?                                                                                                                                                  | Rely on Supabase Auth's built-in limits in Phase 1. Add Upstash when public write endpoints arrive.                                                                            |
| D8     | Require MFA (TOTP) for platform admins and org owners?                                                                                                                                                     | Platform admins: required. Org/business owners: strongly encouraged.                                                                                                           |
| D9     | Supabase and Vercel accounts and projects: Who creates the dev, staging, and production projects and owns the secrets?                                                                                     | A human creates them. I never handle production secrets. Local dev uses the Supabase CLI only.                                                                                 |
| D10    | Map provider (Mapbox vs. Google Maps)                                                                                                                                                                      | Defer to Phase 2. Mapbox is the lean choice.                                                                                                                                   |

---

## 9. Phase 0 report (per §12 of the plan)

| Item                         | Result                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Features implemented         | None (audit phase)                                                                                                                         |
| Files changed                | Added `docs/audit/PHASE_0_REPOSITORY_AUDIT.md` (this file)                                                                                 |
| Database changes             | None                                                                                                                                       |
| Security implications        | None from this change. Weaknesses found are listed in §6.                                                                                  |
| Tests performed              | N/A. No code to test.                                                                                                                      |
| Known limitations            | Branch protection, secret scanning, and org settings can only partly be checked from the agent's access. A repo admin should confirm them. |
| Outstanding risks            | G1–G3 (ownership/licensing), S1 (unprotected `main`), D5 (minors' legal review)                                                            |
| Decisions requiring approval | D1–D10 (§8)                                                                                                                                |

**Next step:** Waiting for your approval of D1–D4. I won't write application code
until then.
