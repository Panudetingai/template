export type generatePostsPromptParams = {
  platforms: string; // "twitter" | "instagram" | "facebook" | "twitter,instagram,facebook"
  tones: string[]; // ["casual", "inspiring", "technical"]
  files: string[]; // ไฟล์ที่แก้ไข
  commitMessages: string[]; // commit message จริงๆ
  commitsContext: string; // diff/patch ของโค้ด
  changeLogContext?: string; // คำอธิบาย commit เพิ่มเติม (ถ้ามี)
  commitsStatus?: string; // สรุปจำนวน +/- lines
};

export const generatePostsPrompt = (params: generatePostsPromptParams) => {
  const requestedPlatforms = params.platforms
    .split(",")
    .map((p) => p.trim().toLowerCase());

  const platformInstructions: Record<string, string> = {
    twitter: `- Max 280 characters (strict)
- One clear idea, punchy and real
- Voice: like a quick tweet mid-session — raw, not polished
- 1–2 emoji only if it fits naturally
- End with a hook: question, observation, or mic-drop
- No hashtags`,

    instagram: `- 6–12 lines with line breaks for breathing room
- Emotional arc: stuck → tried → fixed → relief
- Voice: dev diary — warm, personal, story-like
- Strong opening line (no "วันนี้ผมจะ..." or "Let me share...")
- 4–6 hashtags on last line (mix: #coding + #nextjs #buildinpublic)`,

    facebook: `- 4–7 lines, conversational
- Voice: telling a friend over coffee — relaxed, genuine
- Slightly longer than Twitter, never essay-like
- Optional: end with question to spark comments
- 0–2 hashtags or none`,
  };

  const activePlatformRules = requestedPlatforms
    .filter((p) => platformInstructions[p])
    .map((p) => `**${p.toUpperCase()}**: ${platformInstructions[p]}`)
    .join("\n\n");

  const platformLabel =
    requestedPlatforms.length === 1
      ? requestedPlatforms[0].toUpperCase()
      : requestedPlatforms.map((p) => p.toUpperCase()).join(" / ");

  return `You write social posts for developers who build in public. One post per platform. Share the vibe of the work — not a tutorial.

## CONTEXT

**Commits:** ${params.commitMessages.join(" | ")}
**Extra:** ${params.changeLogContext || "—"}
**Stats:** ${params.commitsStatus || "—"}
**Files:** ${params.files.join(", ") || "—"}
**Diff (may be truncated):**
\`\`\`
${params.commitsContext}
\`\`\`

## RULES

**Language:** Match commit language (Thai commits → Thai post; English → English). Natural mix OK ("fix แล้ว", "ลื่นมาก").

**Tone:** ${params.tones.join(", ")}

**Write from:** What changed and why it matters — not file names or code. Feel the pain → fix → relief.

**Avoid:** Code snippets, filenames, bullet points, "วันนี้ผมจะมาแนะนำ", "Let me walk you through", doc/marketing tone. No tool names unless they're the story ("switched to Bun").

## PLATFORM — ${platformLabel}

${activePlatformRules}

## OUTPUT

Return ONLY the post text. No labels, no prefixes, no explanation. Just the post content.`;
};