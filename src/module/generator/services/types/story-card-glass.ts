import type { CardGlassComingProps } from "@/module/storys/cards-social/aesthetic/card-glass-coming";
import { z } from "zod";

/**
 * ผลลัพธ์ AI สำหรับ `CardGlassComing` — ทุก key required (Groq)
 * ใช้ newline จริงใน string สำหรับ bottom* ได้ (หลายบรรทัด)
 */
export const storyCardGlassAiSchema = z.object({
  line1: z
    .string()
    .max(20)
    .describe("บรรทัดใหญ่บรรทัดที่ 1 — มักเป็นพยางค์สั้น 3–6 ตัวอักษร เช่น SHIP"),
  line2: z
    .string()
    .max(20)
    .describe("บรรทัดใหญ่บรรทัดที่ 2 — เช่น PING"),
  line3: z
    .string()
    .max(20)
    .describe("บรรทัดใหญ่บรรทัดที่ 3 — เช่น NOW"),
  topRight: z
    .string()
    .max(140)
    .describe(
      "มุมขวาบน ตัวพิมพ์เล็ก uppercase — เช่น THEME · DATE · คีย์เวิร์ดจาก commit",
    ),
  bottomLeft: z
    .string()
    .max(200)
    .describe(
      "มุมซ้ายล่าง 2 บรรทัดได้ — ใช้ \\n คั่น — meta / commit short hash",
    ),
  bottomCenter: z
    .string()
    .max(240)
    .describe(
      "กลางล่าง — ใช้ \\n คั่น — tagline จากเรื่องราวของ commit",
    ),
  bottomRight: z
    .string()
    .max(100)
    .describe("มุมขวาล่าง — เช่น DAYILY · ปี"),
});

export type StoryCardGlassAi = z.infer<typeof storyCardGlassAiSchema>;

function unescapePromptNewlines(value: string): string {
  return value.replace(/\\n/g, "\n").trim();
}

export function storyCardGlassAiToCardProps(ai: StoryCardGlassAi): CardGlassComingProps {
  const t = (v: string) => v.trim();
  const out: CardGlassComingProps = {};
  if (t(ai.line1)) out.line1 = t(ai.line1);
  if (t(ai.line2)) out.line2 = t(ai.line2);
  if (t(ai.line3)) out.line3 = t(ai.line3);
  if (t(ai.topRight)) out.topRight = t(ai.topRight);
  if (t(ai.bottomLeft)) out.bottomLeft = unescapePromptNewlines(ai.bottomLeft);
  if (t(ai.bottomCenter)) out.bottomCenter = unescapePromptNewlines(ai.bottomCenter);
  if (t(ai.bottomRight)) out.bottomRight = t(ai.bottomRight);
  return out;
}
