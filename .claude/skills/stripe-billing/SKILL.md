---
name: stripe-billing
description: Use when configuring Stripe subscriptions for this template, testing checkout/webhooks locally, gating features by plan, or extending the webhook handler. Trigger on "stripe", "billing", "subscription", "paywall", "webhook".
---

# Stripe billing

Flow: web calls `POST /billing/checkout` → API creates a Checkout Session → browser goes to Stripe → Stripe calls `POST /webhooks/stripe` → API syncs `subscriptions` + `users.free` (the plan column) → web reads `GET /billing/subscription`. **The webhook is the only thing that changes a user's plan** — never trust the success redirect.

Code: `apps/api/src/modules/billing/` (routes + service), tables `subscriptions` & `stripe_events` in `apps/api/drizzle/schema.ts`, UI in `apps/web/src/module/billing/`.

## Configure
1. Stripe Dashboard (test mode) → create a Product "Pro" with a monthly and a yearly recurring Price.
2. `apps/api/.env`: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_WEBHOOK_SECRET`.
3. Enable the Customer Portal (Settings → Billing → Customer portal) so "Manage subscription" works.
4. Production: add a webhook endpoint `https://<api-host>/webhooks/stripe` with events `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_failed`; use its signing secret.

## Test locally
```bash
stripe listen --forward-to localhost:4000/webhooks/stripe   # prints the whsec_... to put in .env
stripe trigger customer.subscription.updated
```
Pay with card `4242 4242 4242 4242`. Check `subscriptions` and `users.free = 'pro'`.

## Gate a feature by plan
In a service: `const { plan } = await getSubscription(user.id); if (plan === "free") throw new HttpError(402, "Upgrade to Pro", "upgrade_required");`
In the UI: `useSubscription()` from `module/billing/hooks/use-subscription`.

## Extend
- New plan/price → add an env var + case in `priceIdFor`/`intervalForPrice`, extend `Plan`/`BILLING_INTERVALS` in `packages/shared/src/billing.ts`.
- New event type → add a `case` in `handleWebhook`. Keep work inside the transaction so a failure rolls back and Stripe retries; the `stripe_events` row makes redelivery idempotent.
- `past_due` keeps Pro access (grace period) — change `ENTITLED_STATUSES` if you want stricter behavior.

## Pitfalls
- The webhook route must read the **raw** body (`parse: "none"` + `request.text()`); never add a `body` schema to it.
- Verification uses the static `Stripe.webhooks.constructEventAsync` (async crypto — required on Bun).
- Stripe API ≥ 2025-03 puts `current_period_end` on the subscription **item**, not the subscription.
