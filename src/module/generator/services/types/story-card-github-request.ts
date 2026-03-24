import { z } from "zod";

/** รายการ commit จาก GitHub API / client — ใช้ร่วมกับ story card ทุกสไตล์ */
export const storyGithubCommitEntrySchema = z.object({
  commitMessage: z.string(),
  commitSha: z.string(),
  commitAuthor: z.string(),
  commitDate: z.string(),
});

export type StoryGithubCommitEntry = z.infer<typeof storyGithubCommitEntrySchema>;

/**
 * Body ร่วม: เลือก repo + commit อย่างน้อยหนึ่งรายการ — patch ดึงจาก commit ตัวแรก
 */
export const generateStoryCardFromGithubRequestSchema = z.object({
  prompt: z.string().max(1000).optional(),
  repository: z.object({
    repositoryName: z.string().min(1),
    repositoryOwner: z.string().min(1),
  }),
  commit: z.array(storyGithubCommitEntrySchema).min(1).max(20),
});

export type GenerateStoryCardFromGithubRequest = z.infer<
  typeof generateStoryCardFromGithubRequestSchema
>;
