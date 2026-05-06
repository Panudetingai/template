"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/animate-ui/components/radix/sidebar";
import routerConfig from "@/configs/route.config";
import {
  CalculatorIcon,
  CreditCardIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  LucideIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createElement,
  isValidElement,
  useEffect,
  useState,
  type ComponentType,
  type ReactElement,
} from "react";
import TiktokIcon from "@/components/svg/tiktok";

/** Lucide + forwardRef icons are objects (`$$typeof` + `render`), not `typeof === "function"`. */
function renderSidebarIcon(
  icon: LucideIcon | ComponentType | ReactElement,
): React.ReactNode {
  if (isValidElement(icon)) {
    return icon;
  }
  return createElement(icon as ComponentType);
}

type Items = {
  label: string;
  icon: LucideIcon | ComponentType | ReactElement;
  role: string[];
  subItem?: Items[];
  href?: string;
};

type GroupItems = {
  label: string;
  items: Items[];
};

const sidebarItems: GroupItems[] = [
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
        icon: TiktokIcon,
        role: ["pro", "team", "free"],
        subItem: [
          {
            label: "Product",
            icon: LayoutDashboardIcon,
            role: ["pro", "team", "free"],
            href: routerConfig.app.Tiktok,
          },
          {
            label: "Calculator Post",
            icon: CalculatorIcon,
            role: ["pro", "team", "free"],
            href: "",
          },
          {
            label: "Settings",
            icon: SettingsIcon,
            role: ["pro", "team", "free"],
            href: "",
          },
        ],
      },
      {
        label: "Members",
        icon: UsersIcon,
        role: ["pro", "team", "free"],
        href: routerConfig.app.Members,
      },
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

function navItemHasActiveSub(pathname: string, navItem: Items) {
  if (!navItem.subItem?.length) return false;
  return navItem.subItem.some(
    (sub) =>
      sub.href &&
      sub.href.length > 0 &&
      (pathname === sub.href || pathname.startsWith(`${sub.href}/`)),
  );
}

/**
 * Collapsible nav group.
 *
 * When a sub-item is active the trigger is replaced with a plain (non-clickable)
 * button so that Radix never fires onOpenChange — the only reliable way to
 * prevent collapse given that useControlledState always calls setInternalState
 * before our guard runs.
 */
function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: Items;
  pathname: string;
}) {
  const subActive = navItemHasActiveSub(pathname, item);
  const [open, setOpen] = useState(subActive);

  useEffect(() => {
    if (subActive) setOpen(true);
  }, [subActive]);

  const subItems = (
    <CollapsibleContent>
      <SidebarMenuSub>
        {item.subItem?.map((sub) => {
          const href = sub.href?.trim() ?? "";
          const isActive =
            href.length > 0 &&
            (pathname === href || pathname.startsWith(`${href}/`));
          return (
            <SidebarMenuSubItem key={sub.label}>
              {href ? (
                <SidebarMenuSubButton asChild isActive={isActive}>
                  <Link href={href}>
                    {renderSidebarIcon(sub.icon)}
                    <span>{sub.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              ) : (
                <SidebarMenuSubButton
                  className="pointer-events-none opacity-50"
                  aria-disabled
                >
                  {renderSidebarIcon(sub.icon)}
                  <span>{sub.label}</span>
                </SidebarMenuSubButton>
              )}
            </SidebarMenuSubItem>
          );
        })}
      </SidebarMenuSub>
    </CollapsibleContent>
  );

  return (
    <SidebarMenuItem>
      {subActive ? (
        // Locked-open: no trigger rendered so Radix can't fire onOpenChange
        <Collapsible className="group" open={true}>
          <SidebarMenuButton className="cursor-default select-none">
            {renderSidebarIcon(item.icon)}
            <span>{item.label}</span>
            <ChevronRightIcon className="ml-auto rotate-90" />
          </SidebarMenuButton>
          {subItems}
        </Collapsible>
      ) : (
        // Normal: user can open/close freely
        <Collapsible
          className="group"
          open={open}
          onOpenChange={setOpen}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="cursor-pointer">
              {renderSidebarIcon(item.icon)}
              <span>{item.label}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {subItems}
        </Collapsible>
      )}
    </SidebarMenuItem>
  );
}

export default function SidebarContentComponent() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarContent>
      {sidebarItems.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((navItem) => {
              if (navItem.subItem?.length) {
                return (
                  <CollapsibleNavItem
                    key={navItem.label}
                    item={navItem}
                    pathname={pathname}
                  />
                );
              }

              return (
                <SidebarMenuItem key={navItem.label}>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    isActive={
                      Boolean(navItem.href) && pathname === navItem.href
                    }
                    onClick={() => {
                      if (navItem.href) router.push(navItem.href);
                    }}
                  >
                    {renderSidebarIcon(navItem.icon)}
                    <span>{navItem.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
