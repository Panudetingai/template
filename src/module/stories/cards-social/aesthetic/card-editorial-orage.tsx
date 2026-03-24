"use client";

import useUsers from "@/lib/supabase/hooks/use-users";
import { cn } from "@/lib/utils";
import { ArrowRight, UserIcon } from "lucide-react"; // อย่าลืมลง lucide-react นะครับ
import { forwardRef } from "react";

const BG_DARK = "#0a0a0a";
const ACCENT_GREEN = "#b4ff39"; // สีเขียวในรูป

export type CardEditorialOrageProps = {
  className?: string;
  layout?: "standalone" | "canvas";
  titleWhite?: string;    // ส่วนที่เป็นสีขาว (EVER HEARD ABOUT)
  titleGreen?: string;    // ส่วนที่เป็นสีเขียว (MICRO STORY-TELLING?)
  authorName?: string;
  authorRole?: string;
  footerLine1?: string;
  footerLine2?: string;
};

/** Dark Minimalist - Personal Branding Style */
export const CardEditorialOrage = forwardRef<
  HTMLDivElement,
  CardEditorialOrageProps
>(function CardEditorialOrage(
  {
    className,
    layout = "standalone",
    titleWhite = "EVER\nHEARD\nABOUT",
    titleGreen = "MICRO\nSTORY-\nTELLING?",
    authorName = "Zorain Shahzad",
    authorRole = "Personal Branding Coach\nBrand Strategist",
    footerLine1 = "DAYILY • 2025",
    footerLine2 = "THAILAND",
  },
  ref,
) {
    const {user_metadata} = useUsers();
  return (
    <div
      ref={ref}
      className={cn(
        "relative isolate flex flex-col overflow-hidden rounded-[inherit] font-sans",
        layout === "standalone"
          ? "aspect-[4/5] w-full max-w-[500px] @container/card [container-type:inline-size]"
          : "h-full min-h-0 w-full",
        className,
      )}
      style={{ backgroundColor: BG_DARK, color: "#ffffff" }}
    >
      {/* 1. Header Section: Profile & Socials */}
      <div className="absolute top-[6%] left-[6%] right-[6%] z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Profile Circle - จำลองจากรูป */}
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
            {user_metadata?.avatar_url ? <img src={user_metadata?.avatar_url} alt="profile" /> : <UserIcon className="size-8 text-zinc-400" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold leading-none">{user_metadata?.full_name}</span>
            <span className="text-[9px] text-zinc-400 whitespace-pre-line leading-tight mt-1">
              {user_metadata?.email}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Typography Section */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-[8%] pt-[10%]">
        <h2 className="text-left text-[length:clamp(2rem,12cqw,4.5rem)] font-[900] leading-[0.9] tracking-tighter uppercase">
          <span className="block text-zinc-200 whitespace-pre-line">
            {titleWhite}
          </span>
          <span 
            className="block whitespace-pre-line mt-1" 
            style={{ color: ACCENT_GREEN }}
          >
            {titleGreen}
          </span>
        </h2>
      </div>

      {/* 3. Action Button (Arrow) */}
      <div className="absolute right-[8%] top-1/2 -translate-y-1/2 z-20">
        <div 
          className="flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: ACCENT_GREEN }}
        >
          <ArrowRight className="h-7 w-7 text-black stroke-[3]" />
        </div>
      </div>

      {/* 4. Footer Section */}
      <div className="absolute bottom-[6%] left-[8%] z-10">
        <div className="flex flex-col text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          <span>{footerLine1}</span>
          <span>{footerLine2}</span>
        </div>
      </div>

      {/* Subtle Gradient Shadow (Bottom Right) */}
      <div 
        className="pointer-events-none absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full blur-[100px] opacity-20"
        style={{ backgroundColor: ACCENT_GREEN }}
      />
    </div>
  );
});

CardEditorialOrage.displayName = "CardEditorialOrage";