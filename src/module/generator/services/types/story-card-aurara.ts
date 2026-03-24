import { CardEditorialAuroraProps } from "@/module/stories/cards-social/aesthetic/card-editorial-aurora";
import z from "zod";

export const storyCardAuroraAiSchema = z.object({
  titleLine1: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 1 — มักเป็นพยางค์สั้น 3–6 ตัวอักษร เช่น MARK"),
  titleLine2: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 2 — เช่น TWAIN"),
  topLeft: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 3 — เช่น Born —\nNovember 30, 1835"),
  midLeft: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 4 — เช่น Greatest humorist the United States\nAmerican writer"),
  bottomLeftList: z.array(z.string()).max(3).describe("บรรทัดใหญ่บรรทัดที่ 5 — เช่น DAYILY · 2025"),
});

export type StoryCardAuroraAi = z.infer<typeof storyCardAuroraAiSchema>;

export function storyCardAuroraAiToCardProps(ai: StoryCardAuroraAi): CardEditorialAuroraProps {
  const t = (v: string) => v.trim();
  const out: CardEditorialAuroraProps = {};
  if (t(ai.titleLine1)) out.titleLine1 = t(ai.titleLine1);
  if (t(ai.titleLine2)) out.titleLine2 = t(ai.titleLine2);
  if (t(ai.topLeft)) out.topLeft = t(ai.topLeft);
  if (t(ai.midLeft)) out.midLeft = t(ai.midLeft);
  if (ai.bottomLeftList) out.bottomLeftList = ai.bottomLeftList.map(t);
  return out;
}