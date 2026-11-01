# Authorization

_Last updated: Phase 0.5. Model approved under decision D4. Policies are implemented in Phase 1._

## Principles

1. **Enforced server-side, twice.** `policy.ts` in the service layer, and RLS in Postgres.
   The UI only decides what to show.
2. **Roles are memberships, not a global flag.** A user can be an org owner in one
   organization, a reviewer in another, and a plain resident elsewhere.
3. **Deny by default.** A table with RLS enabled and no policy is inaccessible. New tables
   start there.
4. **The service role is an exception, not a tool.** See "Service-role code paths".

## Actors and memberships

| Plan role                  | Represented by                                                       |
| -------------------------- | -------------------------------------------------------------------- |
| Resident                   | `community_members` (role `member`, `moderator`, `admin`)            |
| Student / Applicant        | Any user who owns an `applications` row                              |
| Parent / Guardian          | `guardian_links` (guardian → minor) + `guardian_consents`            |
| Organization Administrator | `organization_members` (role `owner`, `admin`, `editor`, `reviewer`) |
| Business Administrator     | `business_members` (role `owner`, `admin`, `editor`)                 |
| Judge / Reviewer           | `application_reviewers` assignment per opportunity                   |
| Platform Administrator     | `platform_admins` (MFA required, fully audited)                      |

## Permission matrix (Phase 1 scope)

| Action                                 | Who                                                     |
| -------------------------------------- | ------------------------------------------------------- |
| View public community / org / business | Anyone (including signed-out)                           |
| Join a public community                | Any signed-in user                                      |
| Edit community settings                | `community_members.role = admin`, platform admin        |
| Create an organization or business     | Any signed-in user (becomes `owner`; starts unverified) |
| Edit organization / business           | Its `owner` or `admin`, platform admin                  |
| Manage members of an org / business    | Its `owner` (and `admin` for roles below admin)         |
| Verify an organization / business      | Platform admin only                                     |
| Suspend a user                         | Platform admin only                                     |
| Read `audit_logs`                      | Platform admin only                                     |
| Edit own profile                       | The user                                                |

Later phases extend this table in the PR that adds each module.

## RLS implementation pattern

- Helper functions in a `private` schema (not exposed through the API), `security definer`,
  `stable`: `private.is_platform_admin()`, `private.org_role(org_id)`,
  `private.business_role(business_id)`, `private.is_community_member(community_id)`.
- Policies reference the helpers so logic lives in one place.
- Every policy has a pgTAP test in `supabase/tests/` that runs as at least two different
  users and asserts both the allowed and the denied case.

## Service-role code paths

The admin client (`src/lib/supabase/admin.ts`) bypasses RLS. It may be imported **only** from
the modules listed here. `scripts/check-client-secrets.sh` fails CI for any other import.

| Module       | Reason | Added in |
| ------------ | ------ | -------- |
| _(none yet)_ |        |          |

Expected future entries: the Stripe webhook handler (Phase 5), scheduled reconciliation
(Phase 5), account-deletion job (Phase 4+). Each addition is a protected-area change.

## Testing authorization

Unit tests for `policy.ts` cover every row of the permission matrix. RLS tests cover every
policy. E2E tests cover at least one cross-tenant denial per module (org A admin cannot edit org
B). See [TESTING.md](TESTING.md).
