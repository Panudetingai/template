/**
 * Social / OG canvas presets — aspect + export targets + responsive max width.
 */

export type StoryCanvasPreset = "story" | "og" | "square";

export const STORY_CANVAS_PRESETS: Record<
  StoryCanvasPreset,
  {
    aspectClass: string;
    /** Tailwind max-width for preview (fluid) */
    maxWidthClass: string;
    metaLabel: string;
    /** PNG export width (height follows aspect) */
    exportWidth: number;
  }
> = {
  story: {
    aspectClass: "aspect-[9/16]",
    maxWidthClass:
      "max-w-[min(100%,clamp(260px,min(92vw,92dvw),440px))]",
    metaLabel: "Story · 9:16 (1080×1920)",
    exportWidth: 1080,
  },
  og: {
    aspectClass: "aspect-[1200/630]",
    maxWidthClass:
      "max-w-[min(100%,clamp(300px,min(96vw,96dvw),760px))]",
    metaLabel: "OG · 1200×630",
    exportWidth: 1200,
  },
  square: {
    aspectClass: "aspect-square",
    maxWidthClass:
      "max-w-[min(100%,clamp(280px,min(90vw,90dvw),520px))]",
    metaLabel: "Square · 1:1 (1080×1080)",
    exportWidth: 1080,
  },
};
