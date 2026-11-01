# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Email the maintainers at **security@ember.example** _(placeholder — replace with the real
disclosure address before the repository is made public)_ with:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- any affected versions or commits you know of.

We will acknowledge within 3 business days, keep you updated, and credit you in the fix notes
unless you prefer otherwise.

## Scope

In scope: this repository, the deployed Ember application, and its Supabase project
configuration. Out of scope: third-party services (Supabase, Vercel, Stripe) themselves —
report those to the vendor.

Especially welcome: authorization bypasses across communities, organizations, or businesses;
access to application or donor data by unauthorized users; service-role key exposure; payment
webhook forgery or replay.

## Supported versions

Pre-release. Only the `main` branch receives fixes.

## Our controls

See [docs/SECURITY.md](docs/SECURITY.md) for the security requirements this project is built to.
