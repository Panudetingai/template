import Stripe from "stripe";

import { env } from "../env";
import { notConfigured } from "./errors";

let client: Stripe | null = null;

/** Lazily created so the API boots without Stripe keys during development. */
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw notConfigured("Stripe");
  client ??= new Stripe(env.STRIPE_SECRET_KEY);
  return client;
}
