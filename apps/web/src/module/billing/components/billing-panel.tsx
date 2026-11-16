"use client";

import { CreditCard } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import PagePlaceholder from "@/components/apps/page-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortal, useSubscription } from "../hooks/use-subscription";

export function BillingPanel() {
  const { data, isLoading, error } = useSubscription();
  const portal = usePortal();

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (error || !data) {
    return (
      <PagePlaceholder
        icon={CreditCard}
        title="Billing unavailable"
        description={error?.message ?? "We couldn't load your billing details."}
      />
    );
  }

  if (data.plan === "free") {
    return (
      <PagePlaceholder
        icon={CreditCard}
        title="You're on the Free plan"
        description="Upgrade to Pro to unlock unlimited projects and priority support."
      >
        <Button asChild>
          <Link href="/upgrade-to-pro">Upgrade to Pro</Link>
        </Button>
      </PagePlaceholder>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pro <Badge>{data.status}</Badge>
        </CardTitle>
        <CardDescription>
          {data.cancelAtPeriodEnd ? "Ends on " : "Renews on "}
          {data.currentPeriodEnd
            ? new Date(data.currentPeriodEnd).toLocaleDateString()
            : "—"}
          {data.interval && ` · billed every ${data.interval}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          disabled={portal.isPending}
          onClick={() =>
            portal.mutate(undefined, {
              onError: (error) => toast.error(error.message),
            })
          }
        >
          Manage subscription
        </Button>
      </CardContent>
    </Card>
  );
}
