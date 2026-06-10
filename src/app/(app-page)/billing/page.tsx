import PagePlaceholder from "@/components/apps/page-placeholder";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export default function page() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your plan, payment method and invoices.
        </p>
      </div>
      <PagePlaceholder
        icon={CreditCard}
        title="No billing set up yet"
        description="You're currently on the Free plan. Connect a payment provider to manage subscriptions and invoices."
      >
        <Button asChild>
          <Link href="/upgrade-to-pro">Upgrade to Pro</Link>
        </Button>
      </PagePlaceholder>
    </div>
  );
}
