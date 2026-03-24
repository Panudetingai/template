import { SettleTheDebateProps } from "@/module/stories/cards-social/aesthetic/card-settleTheDebate";
import z from "zod";

export const storyCardSettleTheDebateAiSchema = z.object({
  text1: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 1 — มักเป็นพยางค์สั้น 3–6 ตัวอักษร เช่น SETTLE"),
  text2: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 2 — เช่น PING"),
  text3: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 3 — เช่น NOW"),
  text4: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 4 — เช่น THEME · DATE · คียเวิร์ดจาก commit"),
  text5: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 5 — เช่น THEME · DATE · คียเวิร์ดจาก commit"),
});

export type StoryCardSettleTheDebateAi = z.infer<typeof storyCardSettleTheDebateAiSchema>;

function unescapePromptNewlines(value: string): string {
  return value.replace(/\\n/g, "\n").trim();
}

export function storyCardSettleTheDebateAiToCardProps(ai: StoryCardSettleTheDebateAi): SettleTheDebateProps {
  const t = (v: string) => v.trim();
  const out: SettleTheDebateProps = {};
  if (t(ai.text1)) out.text1 = t(ai.text1);
  if (t(ai.text2)) out.text2 = t(ai.text2);
  if (t(ai.text3)) out.text3 = t(ai.text3);
  if (t(ai.text4)) out.text4 = t(ai.text4);
  if (t(ai.text5)) out.text5 = t(ai.text5);
  return out;
}