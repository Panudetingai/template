"use client";

import useUsers from "@/lib/supabase/hooks/use-users";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale/th";
import { forwardRef } from "react";

const BG = "#0D0D0D";
const MUTED = "#8E8E8E";
const ACCENT = "#5674FF";
const CODE_BG = "#1A1A1A";

export type CardBasicProps = {
  className?: string;
  /** `canvas` = fill StoryCanvasFrame; `standalone` = own aspect ratio */
  layout?: "standalone" | "canvas";
  /** e.g. DAYILY WRAPPED */
  seriesLabel?: string;
  /** Thai date line; defaults to today */
  dateLabel?: string;
  title?: string;
  /** Main paragraph (Thai). Use `codeHighlight` for inline CLI snippet. */
  body?: string;
  /** Shown inside a monospace pill in the body line */
  codeHighlight?: string;
  quote?: string;
  footerTag?: string;
  brandLine?: string;
};

export const CardBasic = forwardRef<HTMLDivElement, CardBasicProps>(function CardBasic(
  {
    className,
    layout = "standalone",
    seriesLabel = "DAYILY WRAPPED",
    dateLabel,
    title = "The day I deleted a GitHub Action and slept better.",
    body = "A workflow that used to be clean became a burden every time I had to release — until I found a solution",
    codeHighlight = "gh release create",
    quote = "“A native CLI that understands the environment well usually wins over action wrapper — just by understanding the syntax”",
    footerTag = "DAYILY • 2025",
    brandLine = "Made with",
  },
  ref,
) {
  const date =
    dateLabel ?? format(new Date(), "d MMMM", { locale: th });

    const userName = useUsers().user_metadata?.username;
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col overflow-hidden p-[length:clamp(1rem,5cqw,2rem)] shadow-2xl ring-1 ring-white/10",
        layout === "standalone"
          ? "aspect-[9/16] w-full rounded-[28px] @container/card [container-type:inline-size]"
          : "h-full min-h-0 w-full",
        className,
      )}
      style={{
        backgroundColor: BG,
        color: "#FFFFFF",
        fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <header className="shrink-0 space-y-3">
        <p
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[length:clamp(0.65rem,2.8cqw,0.75rem)] font-medium tracking-[0.12em] uppercase"
          style={{ color: MUTED }}
        >
          <span>{seriesLabel}</span>
          <span
            className="inline-block size-1 shrink-0 rounded-full"
            style={{ backgroundColor: ACCENT }}
            aria-hidden
          />
          <span className="normal-case tracking-normal">{date}</span>
        </p>
        <div className="h-px w-12 bg-white/15" />
      </header>

      <div className="mt-8 min-h-0 flex-1 space-y-5 overflow-hidden">
        <h2 className="text-[length:clamp(1.1rem,5.5cqw,1.6rem)] leading-[1.2] font-bold tracking-tight text-white">
          {title}
        </h2>

        <p
          className="text-[length:clamp(0.75rem,3.2cqw,0.95rem)]"
          style={{ color: MUTED }}
        >
          {body}{" "}
          {codeHighlight ? (
            <code
              className="mx-0.5 inline rounded px-1.5 py-0.5 font-mono text-[length:clamp(0.65rem,2.8cqw,0.8rem)] text-white/95"
              style={{ backgroundColor: CODE_BG }}
            >
              {codeHighlight}
            </code>
          ) : null}
        </p>

        {quote ? (
          <blockquote
            className="border-l-[3px] pl-4 text-[length:clamp(0.75rem,3.2cqw,0.95rem)] italic leading-relaxed"
            style={{ borderColor: ACCENT, color: MUTED }}
          >
            {quote}
          </blockquote>
        ) : null}
      </div>

      <footer className="mt-auto flex shrink-0 flex-wrap items-end justify-between gap-4 pt-10">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-white">{userName}</p>
          <p
            className="text-[10px] font-medium tracking-[0.14em] uppercase"
            style={{ color: MUTED }}
          >
            {footerTag}
          </p>
        </div>
        <p className="max-w-[140px] text-right text-[10px] leading-snug" style={{ color: MUTED }}>
          {brandLine}{" "}
          <span className="font-semibold" style={{ color: ACCENT }}>
            Dayily
          </span>
        </p>
      </footer>
    </div>
  );
});

CardBasic.displayName = "CardBasic";
