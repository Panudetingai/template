export type StoryCardSettleTheDebatePromptParams = {
  commitMessages: string[];
  files: string[];
  commitsContext: string;
  userPrompt?: string;
};

export const generateStoryCardSettleTheDebatePrompt = (params: StoryCardSettleTheDebatePromptParams) => {
  return `You fill a settle the debate style 9:16 story card for developers.
Visual: big 3-line hero (line1, line2, line3) like a magazine cover — NOT the literal words SETTLE / the / debate unless they fit the story.
Corners: small uppercase meta (topRight, bottomLeft, bottomCenter, bottomRight).

## Input
- **Commits:** ${params.commitMessages.join(" | ")}
- **Files:** ${params.files.join(", ")}
- **Diff context (truncated):**
\`\`\`
${params.commitsContext || "(none)"}
\`\`\`
${params.userPrompt?.trim() || ""}
## Rules
- text1: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- text2: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- text3: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- text4: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- text5: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.

## Language
- Snappy English for hero lines is OK; Thai allowed in taglines if it reads better.
`;
};