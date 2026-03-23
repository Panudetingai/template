"use client";

import {
    handleLinkProvider,
    handleUnlinkProvider,
} from "@/components/apps/sidebar/handles/linkprovider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useIdentities from "@/stores/use-Identities";
import { useEffect } from "react";
import { toast } from "sonner";
import { appIntegrations } from "../consts/app-Integrations";

type IntegrationProvider = "github";

export default function ListIntegrations() {
  const identities = useIdentities((s) => s.identities);
  const isLoading = useIdentities((s) => s.isLoading);
  const fetchIdentities = useIdentities((s) => s.fetchIdentities);

  useEffect(() => {
    fetchIdentities();
  }, [fetchIdentities]);

  const isConnected = (provider: string) =>
    identities.some((i) => i.provider === provider);

  const canUnlink = identities.length >= 2;

  const handleToggle = async (provider: IntegrationProvider, checked: boolean) => {
    if (checked) {
      const result = await handleLinkProvider(provider);
      if (result?.error) {
        toast.error(String(result.error));
      }
    } else {
      if (!canUnlink) {
        toast.error("คุณต้องมีวิธีการเข้าสู่ระบบอย่างน้อย 1 วิธี");
        return;
      }
      const result = await handleUnlinkProvider(provider);
      if (result?.error) {
        toast.error(String(result.error));
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      {appIntegrations.map((integration) => {
        const connected = isConnected(integration.provider);
        return (
          <Card
            key={integration.name}
            className="hover:bg-muted/50 transition-all duration-300 w-full"
          >
            <CardContent className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                {integration.icon}
                <div>
                  <h2 className="font-semibold">{integration.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={connected}
                disabled={isLoading}
                onCheckedChange={(checked) =>
                  handleToggle(integration.provider as IntegrationProvider, !!checked)
                }
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
