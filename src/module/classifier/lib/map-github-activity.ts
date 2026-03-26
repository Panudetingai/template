import type { Endpoints } from "@octokit/types";
import type { Commit, PR } from "../types/activity-class";

type RepoCommit = Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"];
type RepoPull = Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"][number];

export function mapGithubCommit(c: RepoCommit): Commit {
  return {
    sha: c.sha,
    message: c.commit.message,
    author:
      c.commit.author?.name?.trim() ||
      c.commit.author?.email?.trim() ||
      c.commit.committer?.name?.trim() ||
      "Unknown",
    additions: c.stats?.additions ?? 0,
    deletions: c.stats?.deletions ?? 0,
    date:
      c.commit.author?.date ??
      c.commit.committer?.date ??
      new Date().toISOString(),
  };
}

export function mapGithubPull(p: RepoPull): PR {
  return {
    number: p.number,
    merged: Boolean(p.merged_at),
  };
}

/** กรอง PR ที่ merge ภายในช่วงเวลา (ให้สอดคล้องกับช่วงของ commits) */
export function filterPullsInCommitWindow(
  pulls: RepoPull[],
  commits: Commit[],
): RepoPull[] {
  if (commits.length === 0) return [];
  const times = commits.map((c) => new Date(c.date).getTime());
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  return pulls.filter((p) => {
    if (!p.merged_at) return false;
    const t = new Date(p.merged_at).getTime();
    return t >= tMin && t <= tMax;
  });
}
