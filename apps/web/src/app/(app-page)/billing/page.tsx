import { BillingPanel } from "@/module/billing/components/billing-panel";

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
      <BillingPanel />
    </div>
  );
}
