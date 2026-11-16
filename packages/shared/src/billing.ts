import { z } from "zod";

/** Plans a user can be on. Mirrors the `plan` enum in the database. */
export const PLANS = ["free", "pro", "enterprise"] as const;
export type Plan = (typeof PLANS)[number];

/** Billing intervals offered at checkout. Each maps to one Stripe Price ID. */
export const BILLING_INTERVALS = ["month", "year"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export const CheckoutSchema = z.object({
  interval: z.enum(BILLING_INTERVALS).default("month"),
});
export type CheckoutSchemaType = z.infer<typeof CheckoutSchema>;

export interface SubscriptionSummary {
  plan: Plan;
  status: string | null;
  interval: BillingInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}
