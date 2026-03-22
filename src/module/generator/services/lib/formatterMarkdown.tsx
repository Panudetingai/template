export function formatForSocial(text: string) {
    return text
      .replace(/\*\*/g, "")        // ลบ bold markdown
      .replace(/###\s/g, "")       // ลบ heading
      .replace(/-\s/g, "• ")       // เปลี่ยน list
      .replace(/\n{3,}/g, "\n\n"); // fix spacing
  }