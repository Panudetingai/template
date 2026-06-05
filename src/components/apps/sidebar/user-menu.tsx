"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabase/client";
import useUsers from "@/lib/supabase/hooks/use-users";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { label: "Upgrade to Pro", icon: Sparkles, href: "/upgrade-to-pro" },
  { label: "Account", icon: BadgeCheck, href: "/account" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
];

type UserMenuProps = {
  variant?: "sidebar" | "compact";
};

export default function UserMenu({ variant = "sidebar" }: UserMenuProps) {
  const supabase = createClient();
  const { user_metadata, isLoading } = useUsers();
  const isMobile = useIsMobile();

  if (!user_metadata || isLoading) return isLoading ? <Spinner className="size-6" /> : null;

  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      window.location.reload();
    });
  };

  const trigger =
    variant === "compact" ? (
      <Button variant="ghost" size="icon" className="rounded-full">
        <Avatar className="size-8">
          <AvatarImage src={user_metadata.avatar_url ?? ""} alt={user_metadata.name ?? ""} />
          <AvatarFallback>{user_metadata.name?.charAt(0) ?? ""}</AvatarFallback>
        </Avatar>
      </Button>
    ) : (
      <Button
        variant="ghost"
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left"
      >
        <Avatar className="size-8">
          <AvatarImage src={user_metadata.avatar_url ?? ""} alt={user_metadata.name ?? ""} />
          <AvatarFallback>{user_metadata.name?.charAt(0) ?? ""}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="font-medium truncate">{user_metadata.name ?? ""}</span>
          <span className="text-muted-foreground truncate text-xs">
            {user_metadata.email ?? ""}
          </span>
        </div>
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user_metadata.avatar_url ?? ""} alt={user_metadata.name ?? ""} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user_metadata.name ?? ""}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user_metadata.email ?? ""}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.label}>
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
