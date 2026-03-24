import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  STORY_CANVAS_PRESETS,
  type StoryCanvasPreset,
} from "./story-canvas-presets";

export type StoryCanvasFrameProps = {
  preset: StoryCanvasPreset;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  showMeta?: boolean;
  /** Extra classes on the aspect box (e.g. ring) */
  frameClassName?: string;
};

/**
 * Responsive preview frame: constrains max width with clamp/vw/dvw and applies aspect ratio.
 */
export function StoryCanvasFrame({
  preset,
  children,
  className,
  containerClassName,
  showMeta = true,
  frameClassName,
}: StoryCanvasFrameProps) {
  const cfg = STORY_CANVAS_PRESETS[preset];

  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
    >
      {showMeta && (
        <p className="text-muted-foreground text-left text-[10px] font-medium tracking-wide uppercase sm:text-xs">
          {cfg.metaLabel}
        </p>
      )}
      <div
        className={cn(
          "relative mx-auto w-full overflow-hidden rounded-xl sm:rounded-2xl @container/story [container-type:inline-size]",
          cfg.maxWidthClass,
          cfg.aspectClass,
          frameClassName,
          containerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
