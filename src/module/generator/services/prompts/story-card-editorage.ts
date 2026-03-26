export type StoryCardEditorialOragePromptParams = {
  commitMessages: string[];
  files: string[];
  commitsContext: string;
  userPrompt?: string;
};

export const generateStoryCardEditorialOragePrompt = (params: StoryCardEditorialOragePromptParams) => {
  return `You fill a editorial orage style 9:16 story card for developers. 
  Visual: big 3-line hero (line1, line2, line3) like a magazine cover — NOT the literal words EDITORIAL / ORAGE unless they fit the story.
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
- titleWhite: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- titleGreen: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- footerLine1: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- footerLine2: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
`;
};