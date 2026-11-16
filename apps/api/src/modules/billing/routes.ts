import { CheckoutSchema } from "@template/shared/billing";
import { Elysia } from "elysia";

import { authPlugin } from "../../plugins/auth";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  handleWebhook,
} from "./service";

export const billingRoutes = new Elysia({ prefix: "/billing", tags: ["billing"] })
  .use(authPlugin)
  .get("/subscription", ({ user }) => getSubscription(user.id), { auth: true })
  .post("/checkout", ({ user, body }) => createCheckoutSession(user, body.interval), {
    auth: true,
    body: CheckoutSchema,
  })
  .post("/portal", ({ user }) => createPortalSession(user), { auth: true });

/**
 * Stripe → API. Public (no bearer token): authenticity comes from the
 * `stripe-signature` header. The body MUST stay raw for verification, hence
 * `parse: "none"` and reading `request.text()` ourselves.
 */
export const stripeWebhookRoutes = new Elysia({
  prefix: "/webhooks",
  tags: ["webhooks"],
}).post(
  "/stripe",
  async ({ request }) =>
    handleWebhook(await request.text(), request.headers.get("stripe-signature")),
  { parse: "none" },
);
