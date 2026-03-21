"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SidebarTrigger } from "../../animate-ui/components/radix/sidebar";
import UserMenu from "./user-menu";

export default function MainHeader() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const pageTitle = useMemo(() => {
    const segment = pathname?.split("/").filter(Boolean).pop() ?? "";
    return segment
      ? segment.charAt(0).toUpperCase() + segment.slice(1)
      : "Repositorie";
  }, [pathname]);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {isMobile && (
        <div className="flex items-center gap-2">
          <Image
            src="/icons/favicon.svg"
            alt="Dayily"
            width={100}
            height={100}
            className="size-10 rounded-lg"
          />
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
        </div>
      )}
      {!isMobile && <SidebarTrigger />}
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
