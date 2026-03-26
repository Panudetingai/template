import type { Endpoints } from "@octokit/types";

type ListCommitItem =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"][number];

/** คีย์ YYYY-MM-DD (UTC จาก ISO ของ GitHub) */
export function groupCommitsByDay(
  commits: ListCommitItem[] | readonly ListCommitItem[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const c of commits) {
    const iso = c.commit.author?.date ?? c.commit.committer?.date;
    if (!iso) continue;
    const day = iso.slice(0, 10);
    map[day] = (map[day] ?? 0) + 1;
  }
  return map;
}
