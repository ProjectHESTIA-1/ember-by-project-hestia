# ADR 0002: Roles as scoped memberships

**Status:** Accepted (decision D4, 2026-11-01)

## Context

The plan lists six roles and requires that users belong to multiple communities and
organizations and hold different roles in each. A single `users.role` column cannot express
"owner of org A, reviewer in org B, resident of two communities".

## Decision

Roles are rows in membership tables scoped to the resource: `community_members`,
`organization_members`, `business_members`, `application_reviewers`, `guardian_links`.
Platform-wide privilege is a separate, small `platform_admins` table.

The plan's §5 table list is extended with: `profiles` (instead of `users`), `business_members`,
`platform_admins`, `opportunities`, `application_reviewers`, `guardian_links`,
`guardian_consents`, `fund_recipients`, `payment_webhook_events`, `referral_scans`,
`volunteer_signups`.

## Consequences

- Authorization checks are joins, so helper functions (`private.org_role(org_id)` etc.) are
  needed to keep policies readable. They are `security definer` and live in a non-exposed schema.
- Every membership table needs a unique `(user_id, resource_id)` constraint and an index on
  `user_id`.
- "Resident" is not a stored role; it is the absence of other roles plus community membership.
