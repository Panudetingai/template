"use client";

import { Sidebar } from "../../animate-ui/components/radix/sidebar";
import SidebarContentComponent from "./sidebar-content";
import SidebarFooterComponent from "./sidebar-footer";
import SidebarHeaderComponent from "./sidebar-header";

export default function SidebarComponent() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderComponent />
      <SidebarContentComponent />
      <SidebarFooterComponent />
    </Sidebar>
  );
}
