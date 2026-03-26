import { classifyActivity } from "@/module/classifier/lib/classifyActivity";
import { groupCommitsByDay } from "@/module/classifier/lib/group-commits-by-day";
import {
  filterPullsInCommitWindow,
  mapGithubCommit,
  mapGithubPull,
} from "@/module/classifier/lib/map-github-activity";
import { suggestedTonesToGeneratorTones } from "@/module/classifier/lib/map-suggested-tones";
import { generatePostsService } from "@/module/generator/services/generator.service";
import type { GeneratedPostsRequest } from "@/module/generator/services/types";
import type { Platform } from "@/module/generator/stores/use-generator";
import { LLMProvider } from "@/module/services/agents/llmprovider.service";
import { githubService } from "@/module/services/github/github.service";
import { Elysia } from "elysia";
import z from "zod";

const repoBody = z.object({
  owner: z.string().min(1),
  repoName: z.string().min(1),
  since: z.string().optional(),
  until: z.string().optional(),
  maxCommits: z.number().min(1).max(100).optional(),
});

const calendarBody = z.object({
  owner: z.string().min(1),
  repoName: z.string().min(1),
  since: z.string().min(1),
  until: z.string().min(1),
});

export const classifier = new Elysia()
  .post(
    "/analyze",
    async ({ body }) => {
      const gh = await githubService();
      const detailedCommits = await gh.getRepositoryCommitsWithStats({
        owner: body.owner,
        repoName: body.repoName,
        since: body.since,
        until: body.until,
        maxCommits: body.maxCommits ?? 40,
      });
      const pulls = await gh.getRepositoryPullRequests({
        owner: body.owner,
        repoName: body.repoName,
      });
      const commits = detailedCommits.map(mapGithubCommit);
      const pullsInWindow = filterPullsInCommitWindow(pulls, commits);
      const prInputs = pullsInWindow.map(mapGithubPull);
      const classified = classifyActivity(commits, prInputs);
      return {
        classified,
        meta: {
          commitCount: commits.length,
          pullRequestCountInWindow: pullsInWindow.length,
        },
      };
    },
    { body: repoBody },
  )
  .post(
    "/calendar",
    async ({ body }) => {
      const gh = await githubService();
      const commits = await gh.getRepositoryCommitsInDateRange({
        owner: body.owner,
        repoName: body.repoName,
        since: body.since,
        until: body.until,
      });
      const days = groupCommitsByDay(commits);
      return {
        days,
        totalCommits: commits.length,
      };
    },
    {
      body: calendarBody,
    },
  )
  .post(
    "/posts",
    async ({ body, set }) => {
      const gh = await githubService();
      const detailedCommits = await gh.getRepositoryCommitsWithStats({
        owner: body.owner,
        repoName: body.repoName,
        since: body.since,
        until: body.until,
        maxCommits: body.maxCommits ?? 40,
      });
      const pulls = await gh.getRepositoryPullRequests({
        owner: body.owner,
        repoName: body.repoName,
      });
      const commits = detailedCommits.map(mapGithubCommit);
      const pullsInWindow = filterPullsInCommitWindow(pulls, commits);
      const prInputs = pullsInWindow.map(mapGithubPull);
      const classified = classifyActivity(commits, prInputs);

      if (classified.topCommits.length === 0) {
        set.status = 400;
        return {
          message:
            "ไม่พบ commit ในช่วงที่เลือก — ลองขยายช่วงวันที่หรือเลือก repo อื่น",
        };
      }

      const tones = suggestedTonesToGeneratorTones(classified.suggestedTone);
      const request: GeneratedPostsRequest = {
        platforms: body.platforms as Platform[],
        tones,
        repository: {
          repositoryName: body.repoName,
          repositoryOwner: body.owner,
        },
        commit: classified.topCommits.map((c) => ({
          commitMessage: c.message,
          commitSha: c.sha,
          commitAuthor: c.author,
          commitDate: c.date,
        })),
      };

      const posts = await generatePostsService(LLMProvider.GROQ).generatePosts(
        request,
      );

      return {
        classified,
        posts,
        meta: {
          commitCount: commits.length,
          pullRequestCountInWindow: pullsInWindow.length,
          tonesUsed: tones,
        },
      };
    },
    {
      body: repoBody.extend({
        platforms: z
          .array(z.enum(["twitter", "facebook", "instagram"]))
          .min(1),
      }),
    },
  );
