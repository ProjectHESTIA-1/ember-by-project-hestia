# Database Schema

_Last updated: Phase 0.5. No migrations exist yet. This document describes the approved target
schema (decision D4) and is updated as each migration lands._

Conventions: PostgreSQL, UUID primary keys (`gen_random_uuid()`), `created_at` /
`updated_at` `timestamptz` on every table, soft deletion via `deleted_at` where noted,
`snake_case` names, RLS enabled on every table in `public`.

## Phase 1 tables

| Table                  | Purpose                                           | Notes                                                                               |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `profiles`             | Application profile for each `auth.users` row     | PK = `auth.users.id`; display name, avatar, DOB-derived minor flag                  |
| `platform_admins`      | Users with platform-wide administrative privilege | Small set; MFA required; every action audited                                       |
| `communities`          | Geographic communities                            | slug, name, description, centroid lat/lng, bounds (JSON), visibility                |
| `community_members`    | User ↔ community, with role                       | role: `member` / `moderator` / `admin`; unique (user, community)                    |
| `organizations`        | Nonprofits, schools, churches, libraries, centers | type, verification_status, `community_id`, `deleted_at`                             |
| `organization_members` | User ↔ organization, with role                    | role: `owner` / `admin` / `editor` / `reviewer`; unique (user, org)                 |
| `businesses`           | Local business profiles                           | category, location, hours (JSON), verification_status, `community_id`, `deleted_at` |
| `business_members`     | User ↔ business, with role                        | role: `owner` / `admin` / `editor`                                                  |
| `audit_logs`           | Sensitive administrative activity                 | actor, action, target table/id, diff (JSON), ip; append-only                        |

## Later phases (summary)

| Phase | Tables                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| 3     | `initiatives`, `campaigns`                                                                                           |
| 4     | `opportunities`, `applications`, `application_files`, `application_reviewers`, `guardian_links`, `guardian_consents` |
| 5     | `fund_recipients`, `donations`, `payment_webhook_events`, `campaign_referrals`, `referral_scans`                     |
| 6     | `events`, `registrations`, `volunteer_opportunities`, `volunteer_signups`, `attendance`                              |
| any   | `notifications`                                                                                                      |

Full column lists are added to this file with the migration that creates each table.

## Indexing rules

Index every foreign key, every `status` column, `events.starts_at`,
`donations.payment_status`, and `(community_id, created_at desc)` on feed tables.

## Financial records

`donations` and `payment_webhook_events` are never hard-deleted or updated in place except
through the webhook reconciliation function. Enforced by RLS (no `UPDATE`/`DELETE` policies) and
a trigger that rejects changes to amount and provider reference columns.

## Migrations

`supabase/migrations/<timestamp>_<name>.sql`, created with `pnpm db:migration <name>`.
Each migration that creates a table also enables RLS on it and ships its policies and a
pgTAP test in `supabase/tests/`. Migrations are forward-only; a rollback is a new migration.
