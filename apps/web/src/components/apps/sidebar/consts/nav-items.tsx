import routerConfig from "@/configs/route.config";
import type { LucideIcon } from "lucide-react";
import {
  BellIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    href: routerConfig.app.Dashboard,
  },
  { label: "Profile", icon: UserIcon, href: routerConfig.app.Profile },
  {
    label: "Notifications",
    icon: BellIcon,
    href: routerConfig.app.Notifications,
  },
  { label: "Settings", icon: SettingsIcon, href: routerConfig.app.Settings },
];

export const settingsNavItems: NavItem[] = [
  { label: "Profile", icon: UserIcon, href: routerConfig.app.Profile },
  { label: "Settings", icon: SettingsIcon, href: routerConfig.app.Settings },
];
