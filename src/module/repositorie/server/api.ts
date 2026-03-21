import { githubService } from "@/module/services/github/github.service";
import { Elysia } from "elysia";
import z from "zod";

export const repositorie = new Elysia()
    .get("/", async () => {
        const githubServiceInstance = await githubService();
        const repositories = await githubServiceInstance.getUserRepositories();
        return {
            repositories
        }
    })
    .get("/:owner/:repoName/commits", async ({params}) => {
        const githubServiceInstance = await githubService();
        const commits = await githubServiceInstance.getUserRepositoriesCommits(params.owner, params.repoName);
        return {
            commits
        }
    }, {
        params: z.object({
            owner: z.string(),
            repoName: z.string(),
        })
    })
    .post("/:owner/:repoName/pulls", async ({params, body}) => {
        const githubServiceInstance = await githubService();
        const pullRequest = await githubServiceInstance.getUserRepositoriesPullRequest({
            owner: params.owner,
            repo: params.repoName,
            pull_number: body.pull_number,
        });
        return {
            pullRequest
        }
    }, {
        params: z.object({
            owner: z.string(),
            repoName: z.string(),
        }),
        body: z.object({
            pull_number: z.number(),
        })
    })
    .post("/:owner/:repoName/pulls/files", async ({params, body}) => {
        const githubServiceInstance = await githubService();
        const pullRequestFiles = await githubServiceInstance.getUserRepositoriesPullRequestFiles({
            owner: params.owner,
            repo: params.repoName,
            pull_number: body.pull_number,
        });
        return {
            pullRequestFiles
        }
    }, {
        params: z.object({
            owner: z.string(),
            repoName: z.string(),
        }),
        body: z.object({
            pull_number: z.number(),
        })
    })