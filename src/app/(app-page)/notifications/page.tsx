import PagePlaceholder from "@/components/apps/page-placeholder";
import { BellIcon } from "lucide-react";

export default function page() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Updates and alerts about your workspace.
        </p>
      </div>
      <PagePlaceholder
        icon={BellIcon}
        title="You're all caught up"
        description="You have no new notifications right now. We'll let you know when something needs your attention."
      />
    </div>
  );
}
