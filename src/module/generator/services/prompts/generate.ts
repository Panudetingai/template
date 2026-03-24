export type generatePostsPromptParams = {
  platforms: string; // "twitter" | "instagram" | "facebook"
  tones: string[]; // ["casual", "inspiring", "technical"]
  files: string[];
  commitMessages: string[];
  commitsContext: string;
  changeLogContext?: string;
  commitsStatus?: string;
};

export const generatePostsPrompt = (params: generatePostsPromptParams) => {
  const requestedPlatforms = params.platforms
    .split(",")
    .map((p) => p.trim().toLowerCase());

  const platformInstructions: Record<string, string> = {
    twitter: `
RULES:
- Hook MUST create curiosity or state a strong opinion in ≤10 words. 
  Examples of good hooks: "Recursive Zod just broke my brain. Then saved it. 🤯"
  Examples of bad hooks: "วันนี้ผม...", "เพื่อนๆ...", "Just shipped..."
- One idea only. Do NOT summarize multiple things.
- Max 2 emojis total. Placed for emphasis, not decoration.
- End with a "mic-drop" insight or a sharp question — not a call to action.
- NO hashtags. NO bullet points.
- Length: 3–5 lines max.`,

    instagram: `
RULES:
- Structure exactly: [Struggle 😫] → [The moment it clicked 💡] → [What's different now ✨]
- Every 1–2 sentences = new line (line break for mobile readability).
- 4–6 emojis used as emotional punctuation, not decoration.
- End with 5–7 hashtags on a separate line: #buildinpublic #devlife #codinglife
- Length: 6–10 lines before hashtags.`,

    facebook: `
RULES:
- Open with the PROBLEM or PAIN, not the solution.
- Tone: telling a NON-DEV friend the story over coffee ☕
  Imagine your audience is: "คนที่ใช้แอปแต่ไม่รู้จัก code"
- TRANSLATE all technical terms into human outcomes:
    ❌ "max-sm:mx-4 หายไป" → ✅ "หน้าเว็บมันชิดขอบจนอ่านไม่ได้บนมือถือ"  
    ❌ "navigator.clipboard.writeText" → ✅ "ปุ่ม copy ที่กดแล้วไม่รู้ว่า copy จริงหรือเปล่า"
    ❌ "disabled Input" → ✅ "กล่องกรอกอีเมลที่กดไม่ได้โดยไม่รู้ทำไม"
    ❌ "error 400" → ✅ "หน้าเว็บฟ้องผิดตอนกดส่ง"
- NEVER mention: class names, function names, variable names, HTTP codes, file names
- Every technical fix must be described by what the USER experiences, not what the code does
- Must include one "Why this matters" sentence (user impact or project impact)
- End with a genuine conversation opener anyone can answer — not just devs
  Good: "ใครเคยกด copy แล้วไม่รู้ว่า copy สำเร็จรึเปล่าบ้าง?"
  Bad: "ใครเคยโดน scope ผิดแล้ว auth พังทั้งระบบบ้าง?"
- 2–4 emojis. NO hashtags. NO bullet points.
- Length: 3–5 short paragraphs.`,
  };

  const toneInstructions: Record<string, string> = {
    professional: "precise, confident, no slang — like a senior dev at a tech talk",
    casual:       "relaxed, like texting a dev friend, short sentences, natural Thai slang OK",
    creative:     "unexpected angle, metaphors welcome, make technical things feel alive",
    educational:  "explain the WHY behind the decision, end with one actionable takeaway",
    motivational: "celebrate the win with energy, strong verbs, make the reader feel the satisfaction",
    technical:    "include one specific technical detail (command, pattern, or concept name) that makes it credible",
    inspiring:    "focus on the human moment — the struggle was real, the breakthrough matters",
  };

  const activeToneGuide = params.tones
    .filter((t) => toneInstructions[t])
    .map((t) => `- ${t}: ${toneInstructions[t]}`)
    .join("\n");

  const activePlatformRules = requestedPlatforms
    .filter((p) => platformInstructions[p])
    .map((p) => `### ${p.toUpperCase()}\n${platformInstructions[p]}`)
    .join("\n\n---\n\n");

  const platformLabel = requestedPlatforms.map((p) => p.toUpperCase()).join(", ");

  return `You are a Senior Developer Advocate who builds in public. 
You transform dry git commits into posts that make other developers think "ใช่เลย ฉันก็เคยเจอแบบนี้"

## INPUT DATA
- **Commits:** ${params.commitMessages.join(" | ")}
- **Extra Context:** ${params.changeLogContext || "None"}
- **Stats:** ${params.commitsStatus || "None"}
- **Modified Files:** ${params.files.join(", ")}
- **Code Diff:**
\`\`\`
${params.commitsContext}
\`\`\`

## YOUR CORE TASK
Find the ONE most interesting moment in these commits.
Not what was changed — but why it was hard, what broke first, or what surprised you.
Then write about THAT moment for each platform.

## TONE GUIDE
Apply ALL of these tones simultaneously — blend them, don't list them:
${activeToneGuide}

## LANGUAGE
- Thai-first for emotional/narrative parts.
- English for technical terms: commit, PR, OAuth, schema, deploy, API, etc.
- Wrap specific commands or names in backticks: \`--generate-notes\`, \`GH_TOKEN\`
- Natural "Dev Thai" mixing is encouraged. Do NOT machine-translate technical concepts.

## STORY STRUCTURE (apply to every platform, adapted per format)
Every post must have these beats — even if subtle:
1. HOOK    — Drop the reader into the problem or the surprise. Skip the setup.
2. TENSION — What made this hard, weird, or interesting?  
3. TURN    — The moment things clicked or broke or worked.
4. PAYOFF  — What's different now? Concrete if possible (lines reduced, bug gone, etc.)

## AUDIENCE AWARENESS (critical)
Before writing each post, ask yourself WHO is reading:
- Twitter   → other developers. Technical details OK. Jargon = credibility.
- Instagram → mixed audience. Tech terms need a 3-word plain explanation after them.
- Facebook  → general public. Zero jargon. Every sentence must make sense 
              to someone who has never written code.
              Test: "Would my mom understand this sentence?" If no → rewrite it.

## STRICT ANTI-PATTERNS (violation = rewrite)
- ❌ DO NOT open with: "วันนี้", "ฉัน/ผม", "เพื่อนๆ", "Excited to", "Just shipped", "Happy to share"
- ❌ NO bullet points in post body
- ❌ NO code snippets or raw file content
- ❌ NO filenames unless it IS the story (e.g., the filename itself is confusing/funny)
- ❌ NO generic lesson like "สิ่งที่ได้เรียนรู้คือ..." — make the lesson land as a punchline, not a report

## EXAMPLES
❌ Bad: "I updated the Zod schema for task validation to support recursion. #coding"
✅ Twitter: "Recursive Zod is a brain-melter until it clicks. 🤯 Task tree is bulletproof now — subtasks 10 levels deep, validation holds. 🛡️"
✅ Facebook: "งมกับ Task ซ้อน Task มาทั้งบ่าย 😫 พอลอง Recursive Schema ของ Zod ปุ๊บ — โค้ดสั้นลงครึ่งนึง แต่จับ Error ได้กริบกว่าเดิม ใครทำ PM Tool น่าจะรู้ความฟินนี้ดี ✨"

## OUTPUT FORMAT
Generate exactly ${requestedPlatforms.length} posts — one per platform.

Platforms to generate: ${platformLabel}

---

${activePlatformRules}

---
End every post with a new line: "— Made with DailyWrapped"
`;
};