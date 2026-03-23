"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useGetUserClient } from "@/lib/getuser";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabase/client";
import useUsers from "@/lib/supabase/hooks/use-users";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SidebarFooter,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../animate-ui/components/radix/sidebar";

const menuItems = [
  {
    label: "Upgrade to Pro",
    icon: Sparkles,
    href: "/upgrade-to-pro",
  },
  {
    label: "Account",
    icon: BadgeCheck,
    href: "/account",
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/billing",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
];

export default function SidebarFooterComponent() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user_metadata, isLoading } = useUsers();

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      router.refresh();
    },
  });
  return (
    <SidebarFooter>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage
                  src={user_metadata?.avatar_url ?? ""}
                  alt={user_metadata?.name ?? ""}
                />
                <AvatarFallback>
                  {user_metadata?.name?.charAt(0) ?? ""}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-medium">{user_metadata?.name ?? ""}</span>
                <span className="text-muted-foreground">
                  {user_metadata?.email ?? ""}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user_metadata?.avatar_url ?? ""}
                    alt={user_metadata?.name ?? ""}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user_metadata?.name ?? ""}
                  </span>
                  <span className="truncate text-xs">
                    {user_metadata?.email ?? ""}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuItems.map((item) => (
                <DropdownMenuItem
                  className="hover:text-sidebar-foreground!"
                  key={item.label}
                >
                  <item.icon />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 text-destructive hover:text-destructive"
              onClick={() => handleLogout()}
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className="size-4" />
              ) : (
                <LogOut className="text-destructive hover:text-destructive" />
              )}
              {isPending ? (
                <span className="text-destructive hover:text-destructive">
                  Logging out...
                </span>
              ) : (
                <span className="text-destructive hover:text-destructive">
                  Log out
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarFooter>
  );
}
