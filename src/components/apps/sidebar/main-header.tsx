"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "../../animate-ui/components/radix/sidebar";
import UserMenu from "./user-menu";

export default function MainHeader() {
  const isMobile = useIsMobile();

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <ToggleMode />
        {isMobile && <UserMenu variant="compact" />}
      </div>
    </div>
  );
}

function ToggleMode() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 100);
  }, []);
  if (!mounted) {
    return <Button size={"icon"} variant="outline" />;
  }
  return (
    <Button
      suppressHydrationWarning
      size={"icon"}
      variant="outline"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
    </Button>
  );
}
