import { eq } from "drizzle-orm";
import Stripe from "stripe";
import type {
  BillingInterval,
  Plan,
  SubscriptionSummary,
} from "@template/shared/billing";

import { stripeEvents, subscriptions, users } from "../../../drizzle/schema";
import { db } from "../../lib/db";
import { badRequest, notConfigured } from "../../lib/errors";
import { getStripe } from "../../lib/stripe";
import { env } from "../../env";
import type { AuthUser } from "../../plugins/auth";

/** Statuses that keep the user on the paid plan (`past_due` = grace period). */
const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

function priceIdFor(interval: BillingInterval): string {
  const priceId =
    interval === "year" ? env.STRIPE_PRICE_PRO_YEARLY : env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) throw notConfigured(`Stripe price for "${interval}" billing`);
  return priceId;
}

function intervalForPrice(priceId: string): BillingInterval | null {
  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY) return "month";
  if (priceId === env.STRIPE_PRICE_PRO_YEARLY) return "year";
  return null;
}

async function getOrCreateCustomer(user: AuthUser): Promise<string> {
  const [row] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, user.id));
  if (row?.stripeCustomerId) return row.stripeCustomerId;

  const customer = await getStripe().customers.create(
    { email: user.email, metadata: { userId: user.id } },
    // Idempotent: a double-click can't create two customers for one user.
    { idempotencyKey: `customer:${user.id}` },
  );
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, user.id));
  return customer.id;
}

export async function getSubscription(userId: string): Promise<SubscriptionSummary> {
  const [user] = await db
    .select({ plan: users.free })
    .from(users)
    .where(eq(users.id, userId));
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  return {
    plan: (user?.plan ?? "free") as Plan,
    status: sub?.status ?? null,
    interval: (sub?.interval as BillingInterval | null) ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
  };
}

export async function createCheckoutSession(
  user: AuthUser,
  interval: BillingInterval,
) {
  const stripe = getStripe();
  const current = await getSubscription(user.id);
  if (current.status && ENTITLED_STATUSES.has(current.status)) {
    throw badRequest("You already have an active subscription. Manage it from billing.");
  }

  const customer = await getOrCreateCustomer(user);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price: priceIdFor(interval), quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { metadata: { userId: user.id } },
    success_url: `${env.WEB_URL}/billing?checkout=success`,
    cancel_url: `${env.WEB_URL}/upgrade-to-pro`,
  });

  return { url: session.url };
}

export async function createPortalSession(user: AuthUser) {
  const customer = await getOrCreateCustomer(user);
  const session = await getStripe().billingPortal.sessions.create({
    customer,
    return_url: `${env.WEB_URL}/billing`,
  });
  return { url: session.url };
}

// ── Webhook handling ─────────────────────────────────────────────────────

async function findUserId(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.userId;
  if (fromMetadata) return fromMetadata;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId));
  return row?.id ?? null;
}

/** Mirror a Stripe subscription into our DB and update the user's plan. */
async function syncSubscription(
  subscriptionId: string,
  tx: Pick<typeof db, "insert" | "update">,
) {
  // Re-fetch instead of trusting the event payload: webhooks can arrive out of
  // order, and Stripe is the source of truth.
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const userId = await findUserId(subscription);
  if (!userId) {
    console.warn(`[stripe] no user for subscription ${subscription.id}`);
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? "";
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;
  const values = {
    userId,
    status: subscription.status,
    priceId,
    interval: intervalForPrice(priceId) ?? item?.price.recurring?.interval ?? null,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  };

  await tx
    .insert(subscriptions)
    .values({ id: subscription.id, ...values })
    .onConflictDoUpdate({ target: subscriptions.id, set: values });

  await tx
    .update(users)
    .set({
      free: ENTITLED_STATUSES.has(subscription.status) ? "pro" : "free",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId));
}

/**
 * Verifies and processes a Stripe webhook. Idempotent: an event id is recorded
 * in the same transaction as its side effects, so retries are safe and a
 * failure rolls everything back (Stripe will redeliver).
 */
export async function handleWebhook(rawBody: string, signature: string | null) {
  if (!env.STRIPE_WEBHOOK_SECRET) throw notConfigured("Stripe webhooks");
  if (!signature) throw badRequest("Missing stripe-signature header");

  let event: Stripe.Event;
  try {
    event = await Stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw badRequest("Invalid Stripe signature");
  }

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(stripeEvents)
      .values({ id: event.id, type: event.type })
      .onConflictDoNothing()
      .returning({ id: stripeEvents.id });
    if (inserted.length === 0) return; // already processed

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const id =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          await syncSubscription(id, tx);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object.id, tx);
        break;
      case "invoice.payment_failed":
        // Status flips to past_due/unpaid via subscription.updated; hook your
        // own "payment failed" email/notification here.
        console.warn(`[stripe] payment failed for invoice ${event.data.object.id}`);
        break;
      default:
        break;
    }
  });

  return { received: true };
}
