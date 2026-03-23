export function formatMarkdown(text: string) {
  return text
    // เส้นคั่น
    .replace(/\s---\s/g, "\n\n---\n\n")

    // headings
    .replace(/\s###\s/g, "\n\n### ")
    .replace(/\s##\s/g, "\n\n## ")

    // bullet list
    .replace(/\s\*\s/g, "\n* ")

    // bold block (กันมันชนกัน)
    .replace(/\*\*/g, "\n**")

    .replace(/\*\*(.*?)\s+\*\*/g, "**$1**")

    // cleanup (กันบรรทัดเกิน)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}