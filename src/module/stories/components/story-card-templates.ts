import { CardBasic } from "@/module/stories/cards-social/aesthetic/card-basic";
import BarcelonaMultilingual from "@/module/stories/cards-social/aesthetic/card-darcelonaMultilingual";
import { CardEditorialAurora } from "@/module/stories/cards-social/aesthetic/card-editorial-aurora";
import { CardEditorialOrage } from "@/module/stories/cards-social/aesthetic/card-editorial-orage";
import { CardGlassComing } from "@/module/stories/cards-social/aesthetic/card-glass-coming";
import { SettleTheDebate } from "@/module/stories/cards-social/aesthetic/card-settleTheDebate";
import type { StoryCanvasPreset } from "@/module/stories/components/socials/story-canvas-presets";
import type { ElementType } from "react";

export type StoryCardTemplateId =
  | "basic"
  | "glass"
  | "editorial-aurora"
  | "editorial-orage"
  | "settle-debate"
  | "barcelona";

/** แมปไป endpoint / model ของ story card */
export type StoryCardAiKind = "none" | "basic" | "glass" | "settle-debate" | "aurora" | "orage";

export type StoryCardTemplateItem = {
  id: StoryCardTemplateId;
  label: string;
  description: string;
  preset: StoryCanvasPreset;
  /** การ์ดแต่ละใบรับ props ไม่เท่ากัน — ใช้ ElementType เพื่อให้ครบทุกเทมเพลต */
  Card: ElementType;
  filename: string;
  captureBackgroundColor: string;
  aiKind: StoryCardAiKind;
};

/** Story 9:16 — ชุดเดียวกับ list-wapper (เฉพาะที่มี Card + filename ครบ) */
export const STORY_CARD_TEMPLATES: StoryCardTemplateItem[] = [
  {
    id: "basic",
    label: "Wrapped",
    description: "มืด · headline + quote",
    preset: "story",
    Card: CardBasic,
    filename: "dayily-ai-wrapped.png",
    captureBackgroundColor: "#0d0d0d",
    aiKind: "basic",
  },
  {
    id: "glass",
    label: "Glass",
    description: "COMING SOON · glass",
    preset: "story",
    Card: CardGlassComing,
    filename: "dayily-glass.png",
    captureBackgroundColor: "#1a1a1a",
    aiKind: "glass",
  },
  {
    id: "editorial-aurora",
    label: "Editorial Aurora",
    description: "สว่าง · editorial",
    preset: "story",
    Card: CardEditorialAurora,
    filename: "dayily-editorial.png",
    captureBackgroundColor: "#f4f4f2",
    aiKind: "aurora",
  },
  {
    id: "editorial-orage",
    label: "Editorial Orage",
    description: "สว่าง · โทนส้ม",
    preset: "story",
    Card: CardEditorialOrage,
    filename: "dayily-editorial-orage.png",
    captureBackgroundColor: "#f4f4f2",
    aiKind: "orage",
  },
  {
    id: "settle-debate",
    label: "Settle the Debate",
    description: "โหวตสองฝั่ง",
    preset: "story",
    Card: SettleTheDebate,
    filename: "dayily-settle-the-debate.png",
    captureBackgroundColor: "#ffffff",
    aiKind: "settle-debate",
  },
  {
    id: "barcelona",
    label: "Barcelona",
    description: "มัลติลิงก์",
    preset: "story",
    Card: BarcelonaMultilingual,
    filename: "dayily-barcelona-multilingual.png",
    captureBackgroundColor: "#e5e5e5",
    aiKind: "none",
  },
];

export function getStoryCardTemplate(
  id: StoryCardTemplateId,
): StoryCardTemplateItem {
  const found = STORY_CARD_TEMPLATES.find((t) => t.id === id);
  if (!found) return STORY_CARD_TEMPLATES[0];
  return found;
}
