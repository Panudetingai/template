"use client";

import { StoryCanvasFrame } from "@/module/storys/components/socials/story-canvas-frame";
import type { StoryCanvasPreset } from "@/module/storys/components/socials/story-canvas-presets";
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
};

export function StorySocialCard({
  preset,
  Card,
  filename,
  captureBackgroundColor = "#0d0d0d",
  frameClassName,
  cardProps,
  showMeta = true,
}: StorySocialCardProps) {

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <StoryCanvasFrame
        preset={preset}
        frameClassName={frameClassName}
        showMeta={showMeta}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <Card layout="canvas" {...cardProps} />
        </div>
      </StoryCanvasFrame>
    </div>
  );
}
