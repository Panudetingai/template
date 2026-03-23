export type generatePostsPromptParams = {
    platforms: string;
    tones: string[];
    files: string[];
    commitMessages: string[];
    commitsContext: string; // ข้อมูลไฟล์ที่แก้, patch, status
    changeLogContext?: string; // คำอธิบาย commit message
    commitsStatus?: string; // สรุปจำนวนการเพิ่ม/ลบ code
}

export const generatePostsPrompt = (params: generatePostsPromptParams) => {
    return `
You are an expert Technical Content Creator and Senior Software Engineer. Your task is to transform technical git commit data into engaging social media posts for ${params.platforms}.

### CONTEXT DATA
- **Project Change Summary:** ${params.commitsStatus || "N/A"}
- **Commit Messages/Changelog:** ${params.commitMessages.join("\n\n") || "No description provided"}
- **Technical Diffs (Files & Patches):**
${params.commitsContext}

### INSTRUCTIONS
1. **Analyze the Intent:** Don't just list changed files. Look at the diffs to understand *why* the changes were made. 
   - *Example:* If you see "added [id]/page.tsx" and "deleted components from page.tsx", identify it as "Refactoring for Reusability" or "Enabling Dynamic Routing".
2. **Identify the Value:** How does this benefit the user or the developer? (e.g., faster performance, cleaner code, new feature).
3. **Tone & Style:** Use a ${params.tones.join(", ")} tone.
4. **Platform Optimization:** Format the output specifically for ${params.platforms} (use hashtags, emojis, and appropriate line breaks).

### OUTPUT STRUCTURE (Generate one post per platform)
- **Catchy Headline:** (Hook the reader with the main achievement)
- **The "What & Why":** (Explain the technical change in an easy-to-understand way)
- **Technical Highlight:** (Mention specific tech like Next.js, TypeScript, or Refactoring patterns found in the diff)
- **Closing & Hashtags**

### CONSTRAINT
- If the code removes many lines and adds a single component, emphasize "Code Cleanliness" and "Abstractions".
- Keep the explanation technically accurate but accessible.

Response:
`;
}