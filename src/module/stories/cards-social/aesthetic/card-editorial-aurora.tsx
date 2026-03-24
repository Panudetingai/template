"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const BG = "#f4f4f2";

export type CardEditorialAuroraProps = {
  className?: string;
  layout?: "standalone" | "canvas";
  titleLine1?: string;
  titleLine2?: string;
  topLeft?: string;
  midLeft?: string;
  bottomLeftList?: string[];
};

/** Light editorial + aurora blobs + grain — museum label layout */
export const CardEditorialAurora = forwardRef<
  HTMLDivElement,
  CardEditorialAuroraProps
>(function CardEditorialAurora(
  {
    className,
    layout = "standalone",
    titleLine1 = "MARK",
    titleLine2 = "TWAIN",
    topLeft = "Born —\nNovember 30, 1835",
    midLeft = "Greatest humorist the United States\nAmerican writer",
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
      style={{ backgroundColor: BG, color: "#0a0a0a" }}
    >
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute top-[8%] left-[5%] h-[55%] w-[70%] rounded-full bg-cyan-300/40 blur-[80px]"
          style={{ transform: "translate(-10%, -5%)" }}
        />
        <div
          className="absolute right-[0%] bottom-[5%] h-[45%] w-[55%] rounded-full bg-blue-600/25 blur-[90px]"
        />
        <div
          className="absolute top-[40%] right-[0%] h-[35%] w-[40%] rounded-full bg-violet-300/30 blur-[70px]"
        />
      </div>

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
        aria-hidden
      />

      <p
        className="absolute top-[5%] left-[5%] z-10 max-w-[45%] whitespace-pre-line text-[length:clamp(0.5rem,3cqw,0.8rem)] leading-snug font-medium"
        style={{ color: "#1a1a1a" }}
      >
        {topLeft}
      </p>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-[6%]">
        <h2 className="font-sans text-center text-[length:clamp(1.35rem,13cqw,3.25rem)] leading-[0.95] font-extrabold tracking-tight text-black">
          <span className="block">{titleLine1}</span>
          <span className="block">{titleLine2}</span>
        </h2>
      </div>

      <p
        className="absolute bottom-[28%] left-[5%] z-10 max-w-[55%] whitespace-pre-line text-[length:clamp(0.5rem,2.8cqw,0.75rem)] leading-relaxed font-normal"
        style={{ color: "#1a1a1a" }}
      >
        {midLeft}
      </p>

      <ul
        className="absolute bottom-[6%] left-[5%] z-10 space-y-[0.15em] text-[length:clamp(0.5rem,2.8cqw,0.75rem)] font-medium"
        style={{ color: "#1a1a1a" }}
      >
        {["DAYILY • 2025"].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
});

CardEditorialAurora.displayName = "CardEditorialAurora";
