import routerConfig from "@/configs/route.config";
import type { LucideIcon } from "lucide-react";
import {
  BrainIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
  ZapIcon
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
  {
    label: "Classifier",
    icon: BrainIcon,
    href: routerConfig.app.Classifier,
  },
  { label: "Generate", icon: SparklesIcon, href: routerConfig.app.Generator },
  { label: "Integrations", icon: ZapIcon, href: routerConfig.app.Integrations },
];

export const settingsNavItems: NavItem[] = [
  { label: "Billing", icon: CreditCardIcon, href: "/billing" },
  { label: "Profile", icon: UserIcon, href: "/profile" },
  { label: "Settings", icon: SettingsIcon, href: routerConfig.app.Settings },
  { label: "Integrations", icon: ZapIcon, href: routerConfig.app.Integrations },
];
