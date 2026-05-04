import routerConfig from "@/configs/route.config";
import {
  CreditCardIcon,
  LayoutDashboardIcon,
  LucideIcon,
  Music2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../animate-ui/components/radix/sidebar";

type Items = {
  label: string;
  icon: LucideIcon;
  role: string[];
  subItem?: Items[];
  href?: string;
};

type groupItems = {
  label: string;
  items: Items[];
};

const sidebarItems: groupItems[] = [
  {
    label: "Apps",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboardIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Dashboard,
      },
      {
        label: "TikTok",
        icon: Music2Icon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Tiktok,
      },
      {
        label: "Members",
        icon: UsersIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Members,
      }
    ],
  },
  {
    label: "Settings",
    items: [
      {
        label: "Billing",
        icon: CreditCardIcon,
        role: ["pro", "team", "free"],
      },
      {
        label: "Profile",
        icon: UserIcon,
        role: ["pro", "team", "free"],
      },
      {
        label: "Organizations",
        icon: UsersIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Organizations,
      },
    ],
  },
];
export default function SidebarContentComponent() {
  const router = useRouter();
  return (
    <SidebarContent>
      {sidebarItems.map((item) => (
        <SidebarGroup key={item.label}>
          <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
          <SidebarMenu>
            {item.items.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton className="cursor-pointer" onClick={() => router.push(item.href ?? "")}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
