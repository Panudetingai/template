import { CardEditorialOrageProps } from "@/module/stories/cards-social/aesthetic/card-editorial-orage";
import z from "zod";

export const storyCardOrageAiSchema = z.object({
    titleWhite: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 1 — มักเป็นพยางค์สั้น 3–6 ตัวอักษร เช่น EVER"),
    titleGreen: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 2 — เช่น HEARD"),
    footerLine1: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 5 — เช่น STORY"),
    footerLine2: z.string().max(20).describe("บรรทัดใหญ่บรรทัดที่ 6 — เช่น TELLING"),
});

export type StoryCardOrageAi = z.infer<typeof storyCardOrageAiSchema>;

export function storyCardOrageAiToCardProps(ai: StoryCardOrageAi): CardEditorialOrageProps {
    const t = (v: string) => v.trim();
    const out: CardEditorialOrageProps = {};
    if (t(ai.titleWhite)) out.titleWhite = t(ai.titleWhite);
    if (t(ai.titleGreen)) out.titleGreen = t(ai.titleGreen);
    if (t(ai.footerLine1)) out.footerLine1 = t(ai.footerLine1);
    if (t(ai.footerLine2)) out.footerLine2 = t(ai.footerLine2);
    return out;
}