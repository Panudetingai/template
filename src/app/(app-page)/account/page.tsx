import PagePlaceholder from "@/components/apps/page-placeholder";
import { Button } from "@/components/ui/button";
import routerConfig from "@/configs/route.config";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

export default function page() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details and security.
        </p>
      </div>
      <PagePlaceholder
        icon={BadgeCheck}
        title="Account settings coming soon"
        description="Update your email, password and security preferences here. For now, you can edit your profile."
      >
        <Button asChild variant="outline">
          <Link href={routerConfig.app.Profile}>Go to profile</Link>
        </Button>
      </PagePlaceholder>
    </div>
  );
}
