"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { BillingInterval } from "@template/shared/billing";

import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/eden-response";

export function useSubscription() {
  return useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: async () => unwrap(await api.billing.subscription.get()),
    staleTime: 1000 * 60,
  });
}

/** Creates a Stripe Checkout session and sends the browser there. */
export function useCheckout() {
  return useMutation({
    mutationFn: async (interval: BillingInterval) => {
      const { url } = unwrap(await api.billing.checkout.post({ interval }));
      if (!url) throw new Error("Stripe did not return a checkout URL");
      window.location.assign(url);
    },
  });
}

/** Opens the Stripe Customer Portal (manage card, cancel, invoices). */
export function usePortal() {
  return useMutation({
    mutationFn: async () => {
      const { url } = unwrap(await api.billing.portal.post());
      if (!url) throw new Error("Stripe did not return a portal URL");
      window.location.assign(url);
    },
  });
}
