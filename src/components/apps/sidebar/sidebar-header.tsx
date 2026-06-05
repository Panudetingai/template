import appConfig from "@/configs/app.config";
import Image from "next/image";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../animate-ui/components/radix/sidebar";

export default function SidebarHeaderComponent() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size={"lg"} className="shadow">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Image
                src={"/favicon.ico"}
                alt={appConfig.name}
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{appConfig.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {appConfig.title}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
