"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const BG = "#1a1a1a";
const MUTED = "rgba(255,255,255,0.45)";

export type CardGlassComingProps = {
  className?: string;
  /** Fill parent canvas (no intrinsic aspect) */
  layout?: "standalone" | "canvas";
  line1?: string;
  line2?: string;
  line3?: string;
  topRight?: string;
  bottomLeft?: string;
  bottomCenter?: string;
  bottomRight?: string;
};

/** Glassmorphism “COMING SOON” style — dark + frosted panels + corner meta */
export const CardGlassComing = forwardRef<HTMLDivElement, CardGlassComingProps>(
  function CardGlassComing(
    {
      className,
      layout = "standalone",
      line1 = "COM",
      line2 = "ING",
      line3 = "SOON",
      topRight = "VISUAL & GRAPHIC EXPLORATION · NOV 17 2025",
      bottomLeft = "ISBN 0011-172025\nEST 1994",
      bottomCenter = "DESIGN PORTFOLIO DAYILY — CREATIVE\nPORTFOLIO COMING SOON",
      bottomRight = "DAYILY • 2025",
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative isolate flex flex-col overflow-hidden rounded-[inherit]",
        layout === "standalone"
          ? "aspect-[9/16] w-full @container/card [container-type:inline-size]"
          : "h-full min-h-0 w-full",
        className,
      )}
        style={{ backgroundColor: BG, color: "#fff", fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif' }}
      >
        {/* Glass panels */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute top-[12%] left-[-8%] h-[42%] w-[58%] rounded-2xl border border-white/20 bg-white/[0.06] backdrop-blur-md"
            style={{ transform: "rotate(-14deg)" }}
          />
          <div
            className="absolute top-[28%] right-[-12%] h-[38%] w-[52%] rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-lg"
            style={{ transform: "rotate(8deg)" }}
          />
          <div
            className="absolute bottom-[18%] left-[5%] h-[32%] w-[48%] rounded-xl border border-white/20 bg-white/[0.06] backdrop-blur-md"
            style={{ transform: "rotate(6deg)" }}
          />
          <div
            className="absolute top-[48%] left-[18%] h-[28%] w-[40%] rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-sm"
            style={{ transform: "rotate(-9deg)" }}
          />
        </div>

        <p
          className="absolute top-[4%] right-[4%] z-10 max-w-[48%] text-right text-[length:clamp(0.45rem,3.2cqw,0.7rem)] leading-snug font-medium tracking-wide uppercase"
          style={{ color: MUTED }}
        >
          {topRight}
        </p>

        <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-[4%] py-[8%]">
          <h2 className="font-sans text-center text-[length:clamp(1.5rem,15cqw,4rem)] leading-[0.92] font-bold tracking-tight text-white">
            <span className="block">{line1}</span>
            <span className="block">{line2}</span>
            <span className="block">{line3}</span>
          </h2>
        </div>

        <p
          className="absolute bottom-[18%] left-[4%] z-10 max-w-[42%] whitespace-pre-line text-[length:clamp(0.45rem,2.8cqw,0.65rem)] leading-snug font-medium tracking-wide uppercase"
          style={{ color: MUTED }}
        >
          {bottomLeft}
        </p>
        <p
          className="absolute bottom-[10%] left-[50%] z-10 max-w-[90%] -translate-x-1/2 whitespace-pre-line text-center text-[length:clamp(0.4rem,2.4cqw,0.6rem)] leading-snug font-medium tracking-wide uppercase"
          style={{ color: MUTED }}
        >
          {bottomCenter}
        </p>
        <p
          className="absolute right-[4%] bottom-[6%] z-10 max-w-[48%] text-right text-[length:clamp(0.45rem,2.8cqw,0.65rem)] leading-snug font-medium tracking-wide uppercase"
          style={{ color: MUTED }}
        >
          @dayily.ai
        </p>
      </div>
    );
  },
);

CardGlassComing.displayName = "CardGlassComing";
