"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCheckout, useSubscription } from "../hooks/use-subscription";

export function UpgradeButton() {
  const { data: subscription } = useSubscription();
  const checkout = useCheckout();
  const isPro = subscription?.plan === "pro";

  return (
    <Button
      className="w-full"
      disabled={isPro || checkout.isPending}
      onClick={() =>
        checkout.mutate("month", {
          onError: (error) => toast.error(error.message),
        })
      }
    >
      {checkout.isPending && <Spinner />}
      {isPro ? "Current plan" : "Upgrade to Pro"}
    </Button>
  );
}
