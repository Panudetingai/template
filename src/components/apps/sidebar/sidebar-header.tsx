import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/elysia/eden-client";
import useIdentities from "@/stores/use-Identities";
import { Github } from "@lobehub/icons";
import Image from "next/image";
import { useEffect } from "react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../animate-ui/components/radix/sidebar";

export default function SidebarHeaderComponent() {
  const handleLinkProvider = async () => {
    const response = await api.auth["link-provider"].post({
      provider: 'github'
    });
    if (response.error) {
      return;
    }
    window.location.href = response.data.url;
  };

  
  const identities = useIdentities((s) => s.identities);
  const isLoading = useIdentities((s) => s.isLoading);
  const fetchIdentities = useIdentities((s) => s.fetchIdentities);

  useEffect(() => {
    fetchIdentities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ derive ใน component → re-render แน่นอน
  const github = identities
    .filter((i) => i.provider === "github")
    .sort(
      (a, b) =>
        new Date(b.last_sign_in_at ?? 0).getTime() -
        new Date(a.last_sign_in_at ?? 0).getTime()
    )[0];

  useEffect(() => {
    fetchIdentities();
  }, [fetchIdentities]);


  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          {isLoading ? (
            <div>
              <Skeleton className="bg-accent h-12 w-full flex items-center gap-2 p-2 rounded-md">
                <Skeleton className="aspect-square size-8 rounded-full flex items-center justify-center">
                  <Spinner className="size-4 text-muted-foreground" />
                </Skeleton>
                <Skeleton className="flex-1 text-left text-sm leading-tight">
                  <Skeleton className="truncate font-semibold" />
                  <Skeleton className="truncate text-xs" />
                </Skeleton>
              </Skeleton>
            </div>
          ) : (
            <>
              {github ? (
                <SidebarMenuButton
                  size={"lg"}
                  className="shadow cursor-pointer"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <Image
                      src={github?.identity_data?.avatar_url ?? ""}
                      alt="Github Avatar"
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {github?.identity_data?.full_name ?? ""}
                    </span>
                    <span className="truncate text-xs">
                      {github?.identity_data?.email ?? ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  size={"lg"}
                  className="shadow cursor-pointer"
                  onClick={handleLinkProvider}
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <Github.Avatar size={24} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Github</span>
                    <span className="truncate text-xs">
                      Connect with Github
                    </span>
                  </div>
                </SidebarMenuButton>
              )}
            </>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
