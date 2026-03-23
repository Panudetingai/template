import routerConfig from "@/configs/route.config";
import type { LucideIcon } from "lucide-react";
import {
  CreditCardIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const mainNavItems: NavItem[] = [
  {
    label: "Repositorie",
    icon: LayoutDashboardIcon,
    href: routerConfig.app.Repositorie,
  },
  { label: "Generate", icon: SparklesIcon, href: "/generator" },
  { label: "Post", icon: MessageCircleIcon, href: "/post" },
  {
    label: "Settings",
    icon: SettingsIcon,
    href: routerConfig.app.Settings,
  },
  { label: "Integrations", icon: ZapIcon, href: routerConfig.app.Integrations },
];

export const settingsNavItems: NavItem[] = [
  { label: "Billing", icon: CreditCardIcon, href: "/billing" },
  { label: "Profile", icon: UserIcon, href: "/profile" },
  { label: "Settings", icon: SettingsIcon, href: routerConfig.app.Settings },
  { label: "Integrations", icon: ZapIcon, href: routerConfig.app.Integrations },
];
