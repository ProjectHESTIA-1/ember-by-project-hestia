# Payment Architecture

> **Status: PROPOSAL — not approved. No payment code may be written until this document is
> approved by the product owner and reviewed by legal/accounting (MVP plan, Phase 5 gate).**

## Non-negotiables (from the MVP plan)

- Donations are voluntary and never required to apply for anything.
- Donations never influence eligibility or judging.
- Businesses never handle, hold, or see donation payment details.
- Every campaign names an **authorized fund recipient** before it can accept donations.
- Ember does not take custody of charitable funds by default.
- No platform fees, payment splitting, or fund transfers without explicit approval.
- Card data never touches Ember (hosted checkout only).

## Proposed flow (Stripe hosted Checkout)

```
Donor ──► campaign page ──► POST create-checkout-session (server)
                                │  validates campaign is active + has approved recipient
                                │  creates donations row (status: pending, referral_id?)
                                ▼
                         Stripe Checkout (hosted)
                                │
                                ▼
                 Stripe webhook ──► /api/webhooks/stripe (server, service role)
                                      verify signature
                                      insert payment_webhook_events (unique event_id) — dedupe
                                      update donations.status (succeeded / failed / refunded)
                                      campaign totals = SUM(confirmed donations) via view
```

## Open questions for human decision

1. **Who is the Stripe account holder?** Options: (a) each recipient organization connects its
   own Stripe account (Stripe Connect, direct charges) so funds never touch Ember; (b) a
   single fiscal sponsor's account; (c) Ember's account with payouts (Ember takes custody —
   discouraged by the plan). Recommendation: **(a)** for verified recipients.
2. Platform fee: none in V1 unless approved.
3. Refund policy and who can initiate refunds.
4. Receipts / tax acknowledgments: who issues them (the recipient, not Ember, under option a).
5. Minimum and maximum donation amounts.

## Data

`fund_recipients`, `donations`, `payment_webhook_events`, `campaign_referrals`,
`referral_scans`. See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md). Financial rows are append-only
except via the webhook reconciliation function.

## Attribution

QR codes carry an opaque `campaign_referrals.code`. Scans are logged. A donation is attributed
to a referral only when the **webhook-confirmed** payment's checkout session carries that
referral ID. Businesses see counts and confirmed totals only; never donor identity or payment
details.
