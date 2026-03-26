"use client";

import { cn } from "@/lib/utils";
import { StoryCanvasFrame } from "@/module/stories/components/socials/story-canvas-frame";
import type { StoryCanvasPreset } from "@/module/stories/components/socials/story-canvas-presets";
import type { ElementType } from "react";

type StorySocialCardProps = {
  preset: StoryCanvasPreset;
  /** การ์ดบางตัวไม่ประกาศ `layout` ใน props — ยังส่ง `layout="canvas"` ได้ */
  Card: ElementType;
  filename?: string;
  ref?: React.RefObject<HTMLDivElement>;
  /** Match card base color for PNG export */
  captureBackgroundColor?: string;
  frameClassName?: string;
  /** Props ส่งต่อให้การ์ด (เช่น ข้อมูลจาก AI) — `layout` ถูกบังคับเป็น canvas */
  cardProps?: Record<string, unknown>;
  showMeta?: boolean;
  /**
   * ลดการเลือกข้อความ / คลิกขวา / copy จากพรีวิว (ทำให้ยากขึ้นเท่านั้น — ไม่กัน DevTools/F12)
   * @default true
   */
  contentProtection?: boolean;
};

export function StorySocialCard({
  preset,
  Card,
  frameClassName,
  cardProps,
  showMeta = true,
  contentProtection = true,
}: StorySocialCardProps) {
  const protect = contentProtection;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3",
        protect && "select-none",
      )}
      onContextMenu={protect ? (e) => e.preventDefault() : undefined}
      onCopy={protect ? (e) => e.preventDefault() : undefined}
      onDragStart={protect ? (e) => e.preventDefault() : undefined}
    >
      <StoryCanvasFrame
        preset={preset}
        frameClassName={cn(
          frameClassName,
          protect && "[&_img]:pointer-events-none [&_img]:select-none",
        )}
        showMeta={showMeta}
      >
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-[inherit]",
            protect && "**:select-none",
          )}
        >
          <Card layout="canvas" {...cardProps} />
        </div>
      </StoryCanvasFrame>
    </div>
  );
}
