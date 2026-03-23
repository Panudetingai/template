'use client';

import ListIntegrations from "@/module/integrations/components/list-integrations";

export default function page() {
  return(
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold">Integrations</h1>
            <p className="text-muted-foreground text-sm">
                Connect your repositories to your database.
            </p>
        </div>
        <ListIntegrations />
    </div>
  )
}
