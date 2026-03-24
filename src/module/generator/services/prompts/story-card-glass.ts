export type StoryCardGlassPromptParams = {
  commitMessages: string[];
  files: string[];
  commitsContext: string;
  userPrompt?: string;
};

export const generateStoryCardGlassPrompt = (
  params: StoryCardGlassPromptParams,
) => {
  const files =
    params.files.length > 0 ? params.files.join(", ") : "(none listed)";

  const userNotes =
    params.userPrompt && params.userPrompt.trim().length > 0
      ? `
## User notes
${params.userPrompt.trim()}
`
      : "";

  return `You fill a glassmorphism "editorial poster" story card (9:16) for developers.
Visual: big 3-line hero (line1, line2, line3) like a magazine cover — NOT the literal words COM / ING / SOON unless they fit the story.
Corners: small uppercase meta (topRight, bottomLeft, bottomCenter, bottomRight).

## Input
- **Commits:** ${params.commitMessages.join(" | ")}
- **Files:** ${files}
- **Diff context (truncated):**
\`\`\`
${params.commitsContext || "(none)"}
\`\`\`
${userNotes}
## Rules
- Hero lines: one angle from ONE commit story — 3 short chunks (line1, line2, line3), punchy, EN or TH mixed OK.
- topRight: one line, uppercase style, · separators — theme + meta.
- bottomLeft, bottomCenter: may include line breaks as real newline characters inside the JSON string values.
- bottomRight: short e.g. DAYILY · 2025
- Every JSON field is required; use "" only if truly empty (prefer non-empty).
- No hashtags. No bullet characters in strings.

## Language
- Snappy English for hero lines is OK; Thai allowed in taglines if it reads better.
`;
};
