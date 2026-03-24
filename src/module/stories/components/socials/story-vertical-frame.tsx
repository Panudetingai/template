import type { ReactNode } from "react";
import { StoryCanvasFrame } from "./story-canvas-frame";

export type StoryVerticalFrameProps = {
  children: ReactNode;
  className?: string;
  showMeta?: boolean;
  frameClassName?: string;
};

/**
 * Vertical story frame (9:16) — alias for {@link StoryCanvasFrame} preset `story`.
 */
export function StoryVerticalFrame({
  children,
  className,
  showMeta = true,
  frameClassName,
}: StoryVerticalFrameProps) {
  return (
    <StoryCanvasFrame
      preset="story"
      className={className}
      showMeta={showMeta}
      frameClassName={frameClassName}
    >
      <div className="absolute inset-0">{children}</div>
    </StoryCanvasFrame>
  );
}
