export type StoryCardBasicPromptParams = {
  commitMessages: string[];
  files: string[];
  commitsContext: string;
  /** โน้ตจากผู้ใช้ (เพิ่มบริบทหรือโทน) */
  userPrompt?: string;
};

export const generateStoryCardBasicPrompt = (
  params: StoryCardBasicPromptParams,
) => {
  const files =
    params.files.length > 0 ? params.files.join(", ") : "(ไม่ระบุไฟล์)";

  const userNotes =
    params.userPrompt && params.userPrompt.trim().length > 0
      ? `
## User notes (follow if compatible)
${params.userPrompt.trim()}
`
      : "";

  return `You are a senior developer writing ONE "Dayily Wrapped" story card for social (9:16).
The card template needs short, punchy copy — not a blog post.

## Input
- **Commit messages:** ${params.commitMessages.join(" | ")}
- **Files touched:** ${files}
- **Code / diff context (may be truncated):**
\`\`\`
${params.commitsContext || "(none)"}
\`\`\`
${userNotes}
## Task
Pick the SINGLE most interesting thread: the struggle, the surprise, or the fix — not a feature list.
Output MUST match the JSON schema you are given (field names exact).
Every key in the schema is required — for optional-looking fields (codeHighlight, quote, username, footerTag, brandLine) use an empty string "" when you do not want that UI block; never omit a key.

## Language & style
- Thai-first for emotional lines; English for technical terms (commit, deploy, OAuth, schema, API, CLI commands).
- No hashtags. No bullet lists in any string.
- title: hook-like, ≤ ~12 words if Thai-heavy.
- body: 1–2 sentences that flow into the inline \`codeHighlight\` pill; end the sentence naturally (no fixed suffix after the pill).
- quote: optional; one sharp line, can use curly quotes in the string.
- username: optional; prefer @handle style if you invent one.

## Anti-patterns
- Do NOT open title with "วันนี้", "แก้บั๊ก", "อัปเดต"
- Do NOT paste raw filenames unless the name itself is the joke
- Do NOT exceed the max length implied by the schema descriptions
`;
};
