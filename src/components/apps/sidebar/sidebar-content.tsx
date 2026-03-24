import routerConfig from "@/configs/route.config";
import {
  BookIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LucideIcon,
  MessageCircleIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
  ZapIcon,
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
        label: "Repositorie",
        icon: LayoutDashboardIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Repositorie,
      },
      {
        label: "Generate",
        icon: SparklesIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Generator,
      },
      {
        label: "Post",
        icon: MessageCircleIcon,
        role: ["pro", "team", "free"],
      },
      {
        label: "stories",
        icon: BookIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Stories,
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
        label: "Integrations",
        icon: ZapIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Integrations,
      },
      {
        label: "Settings",
        icon: SettingsIcon,
        role: ["pro", "team", "free"],
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
