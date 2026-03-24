import type { CardBasicProps } from "@/module/storys/cards-social/aesthetic/card-basic";
import { z } from "zod";

/**
 * ฟิลด์ที่ AI สร้างให้ `CardBasic`
 * ทุก key ต้อง required (รวม "") — Groq json_schema
 */
export const storyCardBasicAiSchema = z.object({
  seriesLabel: z.string().max(48).describe("หัวซีรีส์มุมบน เช่น DAYILY WRAPPED"),
  title: z.string().max(160).describe("หัวข้อหลัก"),
  body: z
    .string()
    .max(420)
    .describe(
      "ย่อหน้าก่อน code pill — การ์ดต่อท้ายด้วย code แล้วคำว่า ครั้งแรก",
    ),
  codeHighlight: z
    .string()
    .max(72)
    .describe('snippet ใน pill — ไม่ใช้ให้ส่ง ""'),
  quote: z.string().max(320).describe('คำคม — ไม่ใช้ให้ส่ง ""'),
  username: z.string().max(48).describe('เช่น @handle — ไม่ใช้ให้ส่ง ""'),
  footerTag: z.string().max(64).describe('แท็กมุมล่าง — ไม่ใช้ให้ส่ง ""'),
  brandLine: z.string().max(48).describe('ก่อนคำว่า Dayily — ไม่ใช้ให้ส่ง ""'),
});

export type StoryCardBasicAi = z.infer<typeof storyCardBasicAiSchema>;

export function storyCardBasicAiToCardProps(ai: StoryCardBasicAi): CardBasicProps {
  const t = (v: string) => v.trim();
  const out: CardBasicProps = {};
  if (t(ai.seriesLabel)) out.seriesLabel = t(ai.seriesLabel);
  if (t(ai.title)) out.title = t(ai.title);
  if (t(ai.body)) out.body = t(ai.body);
  if (t(ai.codeHighlight)) out.codeHighlight = t(ai.codeHighlight);
  if (t(ai.quote)) out.quote = t(ai.quote);
  if (t(ai.username)) out.username = t(ai.username);
  if (t(ai.footerTag)) out.footerTag = t(ai.footerTag);
  if (t(ai.brandLine)) out.brandLine = t(ai.brandLine);
  return out;
}
