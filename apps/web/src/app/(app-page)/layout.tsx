import {
  SidebarInset,
  SidebarProvider,
} from "@/components/animate-ui/components/radix/sidebar";
import MainHeader from "@/components/apps/sidebar/main-header";
import MobileBottomNav from "@/components/apps/sidebar/mobile-bottom-nav";
import SidebarComponent from "@/components/apps/sidebar/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AppPageLayout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <SidebarComponent />
      <SidebarInset className="flex min-h-svh flex-col p-4 pb-20 md:pb-4">
        <MainHeader />
        <main className="flex-1 w-full mt-4 max-w-4xl mx-auto">{children}</main>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
