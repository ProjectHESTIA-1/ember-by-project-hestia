# Environment Variables

All variables are validated at startup by `src/lib/env/`. Missing or malformed values fail
fast with a message that names the variable but never prints its value.

## Public (inlined into the browser bundle)

Prefix `NEXT_PUBLIC_`. **Must never contain a secret.** CI fails if a `NEXT_PUBLIC_` name
contains `SECRET`, `SERVICE_ROLE`, `PRIVATE`, `PASSWORD`, or `TOKEN`.

| Variable                        | Purpose                     | Local value                |
| ------------------------------- | --------------------------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase API URL            | `http://127.0.0.1:54321`   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key (RLS applies) | printed by `pnpm db:start` |
| `NEXT_PUBLIC_SITE_URL`          | Canonical site origin       | `http://localhost:3000`    |

## Server only

Read only in `src/lib/env/server.ts` (a `server-only` module). Never referenced elsewhere by
name; CI enforces this.

| Variable                    | Purpose                         | Owner                |
| --------------------------- | ------------------------------- | -------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS; admin client only | platform maintainers |

## Phase 5 (not yet used)

| Variable                | Purpose                        |
| ----------------------- | ------------------------------ |
| `STRIPE_SECRET_KEY`     | Server-side Stripe API         |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |

## Where values live

| Environment                | Location                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Local                      | `.env.local` (git-ignored). Start from `.env.example`.                             |
| CI                         | Placeholder public values in `ci.yml`; no server secrets.                          |
| Preview/Staging/Production | Vercel project environment variables, scoped per environment, set by a maintainer. |

Contributors never receive staging or production values.
