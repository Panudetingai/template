import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { StoryCanvasFrame } from "./story-canvas-frame";

export type StoryOgImageWrapperProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  showMeta?: boolean;
  frameClassName?: string;
};

/**
 * OG landscape frame (1200×630) — thin wrapper over {@link StoryCanvasFrame} preset `og`.
 */
export function StoryOgImageWrapper({
  children,
  className,
  containerClassName,
  showMeta = true,
  frameClassName,
}: StoryOgImageWrapperProps) {
  return (
    <StoryCanvasFrame
      preset="og"
      className={className}
      containerClassName={containerClassName}
      showMeta={showMeta}
      frameClassName={cn(
        "border border-border/80 bg-muted/30 shadow-sm ring-1 ring-black/5 dark:ring-white/10",
        frameClassName,
      )}
    >
      <div className="absolute inset-0 flex h-full w-full flex-col">{children}</div>
    </StoryCanvasFrame>
  );
}
