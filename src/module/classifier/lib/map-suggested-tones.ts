import type { Tone } from "@/module/generator/stores/use-generator";

/** แมป suggestedTone จาก classifyActivity → Tone ที่ใช้ใน generator */
const LABEL_TO_TONE: Record<string, Tone> = {
  motivational: "casual",
  technical: "technical",
  casual: "casual",
  inspiring: "creative",
  educational: "academic",
  creative: "creative",
};

export function suggestedTonesToGeneratorTones(suggested: string[]): Tone[] {
  const out: Tone[] = [];
  for (const raw of suggested) {
    const key = raw.toLowerCase().trim();
    const t = LABEL_TO_TONE[key] ?? ("professional" as Tone);
    if (!out.includes(t)) out.push(t);
  }
  if (out.length === 0) out.push("professional");
  return out.slice(0, 5);
}
