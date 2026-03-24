import { summarizePatches } from "@/module/generator/services/lib/summzieContext";
import type { GenerateStoryCardFromGithubRequest } from "@/module/generator/services/types/story-card-github-request";

export type StoryCardCommitContext = {
  commitMessages: string[];
  files: string[];
  /** patch ที่ truncate แล้วสำหรับ prompt */
  commitsContext: string;
};

type GithubFilesPayload = {
  files?: Array<{ filename: string; patch?: string | null }> | null;
};

/**
 * ดึงไฟล์/patch จาก commit แรก รวมข้อความ commit ทุกตัวที่ส่งมา
 */
export async function buildStoryCardCommitContext(
  getCommitFiles: (args: {
    owner: string;
    repoName: string;
    commitSha: string;
  }) => Promise<GithubFilesPayload>,
  request: GenerateStoryCardFromGithubRequest,
): Promise<StoryCardCommitContext> {
  const first = request.commit[0];
  const payload = await getCommitFiles({
    owner: request.repository.repositoryOwner,
    repoName: request.repository.repositoryName,
    commitSha: first.commitSha,
  });

  const files = payload.files?.map((f) => f.filename) ?? [];
  const patches = payload.files?.map((f) => f.patch ?? "").join("\n") ?? "";

  return {
    commitMessages: request.commit.map((c) => c.commitMessage),
    files,
    commitsContext: summarizePatches(patches),
  };
}
