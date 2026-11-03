# Supabase Setup Guide

A step-by-step checklist for setting up Ember's hosted Supabase projects. Written for the
project owner. No coding needed except the optional step 8.

Under decision D9, a person creates the accounts and owns the secrets. Claude never
handles production secrets.

**Time needed:** about 30 minutes. **Cost:** $0 for now (staging runs on the free plan).

---

## The big picture

You'll end up with **two Supabase projects**:

| Project            | Used for                      | When to create                           |
| ------------------ | ----------------------------- | ---------------------------------------- |
| `ember-staging`    | Testing. Fake data only.      | **Now**                                  |
| `ember-production` | Real residents and real data. | **Later**, right before launch (Phase 7) |

Each project has three values the app needs:

| Value                                      | Secret?                                   | Where it goes                                                     |
| ------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------- |
| Project URL                                | No                                        | Vercel environment variables (later)                              |
| Anon key (may be labeled "publishable")    | No. Safe to be public; RLS protects data. | Vercel environment variables (later)                              |
| Service-role key (may be labeled "secret") | **YES.** It bypasses all security rules.  | Vercel environment variables only. Never in chat, email, or code. |

**Never paste the service-role key or the database password into a chat, issue, or commit.**
The **project reference ID** isn't secret and is fine to share.

---

## Step 1 — Account and organization (5 min)

1. Go to **supabase.com** → **Start your project** → sign in with **GitHub**.
2. Turn on **two-factor authentication**: avatar (top right) → **Account Settings** → **Security**.
3. Create an **organization** named **Ember** on the Free plan. Keep it separate from anything
   Project HESTIA uses, including billing.

## Step 2 — Staging project (5 min)

1. In the Ember org → **New project**.
2. **Name:** `ember-staging`.
3. **Database password:** click **Generate**, then save it in a password manager. You'll need
   it in step 5.
4. **Region:** the region closest to your first community.
5. **Create**, then wait about 2 minutes.
6. Copy the **Reference ID** (Project Settings → General).

> Status: a project exists with reference ID `hunfedxeuskkawzodxrs`. Confirm it is the
> **staging** project (see step 7).

## Step 3 — Sign-in security (10 min)

In the project → **Authentication**:

| Setting                 | Where                       | Set to                                      |
| ----------------------- | --------------------------- | ------------------------------------------- |
| Site URL                | URL Configuration           | `http://localhost:3000` until Vercel exists |
| Redirect URLs           | URL Configuration           | add `http://localhost:3000/**`              |
| Confirm email           | Sign In / Providers → Email | **On**                                      |
| Minimum password length | Sign In / Providers → Email | **12**                                      |
| Password requirements   | same place                  | **Letters and digits**                      |
| Secure password change  | same place                  | **On**                                      |
| Multi-factor (TOTP)     | Multi-Factor                | **Enabled**                                 |
| Anonymous sign-ins      | Sign In / Providers         | **Off**                                     |

These match `supabase/config.toml`, so staging behaves like local development.

> **Email:** Supabase's built-in sender only sends a few emails per hour. That's fine for
> testing. Before real residents sign up, set up a custom email service (e.g. Resend or
> Postmark) under Authentication → Emails → SMTP.

## Step 4 — Database safety (2 min)

Project Settings → **Database** → **Enforce SSL on incoming connections:** On.

## Step 5 — Let GitHub apply database changes (5 min)

1. Supabase avatar → **Account Settings** → **Access Tokens** → **Generate new token**, named
   `github-ember-staging`. Copy it.
2. GitHub repo → **Settings** → **Environments** → **New environment** → `staging`.
3. Add three **Environment secrets** to `staging`:

   | Secret name             | Value                       |
   | ----------------------- | --------------------------- |
   | `SUPABASE_ACCESS_TOKEN` | the token from 5.1          |
   | `SUPABASE_PROJECT_REF`  | the Reference ID (step 2.6) |
   | `SUPABASE_DB_PASSWORD`  | the password from step 2.3  |

The workflow that uses these is written in Phase 1 and reviewed in its PR (it's a protected area).

## Step 6 — Production (later, at Phase 7)

- Upgrade the Ember org to **Pro** for daily backups (point-in-time recovery recommended once
  donations go live).
- Repeat steps 2–5 with `ember-production` and a GitHub environment named `production` with
  **Required reviewers** set to the owner, so production changes wait for approval.

## Step 7 — Supabase MCP server (lets Claude Code read the project)

The repo's `.mcp.json` connects Claude Code to the project `hunfedxeuskkawzodxrs` through
Supabase's hosted MCP server. On first use, Claude Code opens a browser to sign in to Supabase.
Nothing secret is stored in the file.

Rules:

- **Only ever point it at staging or a development project. Never at production.** It can
  run SQL and change schema on whatever project it targets.
- It's currently enabled with the `account`, `database`, `development`, `functions`, and
  `branching` features, which include write access. To limit it to reading, add
  `&read_only=true` to the URL in `.mcp.json`. Recommended once real test data exists.
- Schema changes still go through migration files in `supabase/migrations/` and a PR. The MCP
  server is for inspecting, debugging, and generating types, not for hand-editing the database.

## Step 8 — Optional: run Ember on your own computer

1. Install **Docker Desktop**, **Node 22**, and **pnpm**.
2. In the project folder:
   ```bash
   pnpm install
   cp .env.example .env.local
   pnpm db:start
   ```
3. `db:start` prints a local **anon key** and **service_role key** (throwaway values). Paste
   them into `.env.local`.
4. `pnpm dev`, then open http://localhost:3000.

---

## Checklist

- [ ] Supabase account with 2FA on
- [ ] "Ember" organization
- [ ] `ember-staging` project; DB password saved in a password manager
- [ ] Auth settings from step 3 applied
- [ ] SSL enforced
- [ ] GitHub `staging` environment with 3 secrets
- [ ] Confirmed the MCP server points at staging, not production
