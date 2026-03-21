import { db } from "@/lib/drizzle";
import { createClient, getUser } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { Octokit } from "octokit";
import { cache } from "react";
import { githubAccessTokens } from "../../../../drizzle/schema";
import {
    PullRequestParameters,
    pullRequestsFilterParameters,
    RestEndpointMethodTypes,
} from "../types";
class GithubService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   *
   * @param providerToken
   * @returns Octokit instance
   */
  private async getOctokit(providerToken: string) {
    return new Octokit({
      auth: providerToken,
      request: {
        request: {
          fetch: (url: string, opts: RequestInit) =>
            fetch(url, {
              ...opts,
              next: { revalidate: 300 },
            }),
        },
      },
    });
  }

  /**
   * Get user provider token
   * @returns Provider token
   */
  private async getUserProviderToken() {
    const user = await getUser();
    if (!user) throw new Error("User not fount");
    const providerToken = await db
      .select({
        providerToken: githubAccessTokens.providerToken,
      })
      .from(githubAccessTokens)
      .where(eq(githubAccessTokens.userId, user.id))
      .then((res) => res[0]);

    if (!providerToken) throw new Error("Provider token not found");
    return this.getOctokit(providerToken.providerToken);
  }

  /**
   * Get user repositories
   * @returns List of user repositories from github
   */
  public getUserRepositories = cache(async () => {
    const providerToken = await this.getUserProviderToken();
    const repositories =
      await providerToken.rest.repos.listForAuthenticatedUser();
    return repositories.data;
  });

  /**
   * Get user repositories Commits from github
   * @param owner - Owner name
   * @param repoName - Repository name
   * @returns List of commits from repository
   */
  public getUserRepositoriesCommits = cache(
    async (owner: string, repoName: string) => {
      const providerToken = await this.getUserProviderToken();
      const commits = await providerToken.rest.repos.listCommits({
        owner: owner,
        repo: repoName,
      });
      return commits.data;
    },
  );

  /**
   * Get user repositories Pull Requests from github
   * @param {RestEndpointMethodTypes} params - Parameters for the request
   * @returns List of pull requests from repository
   */
  public getUserRepositoriesPullRequests = cache(
    async (params: RestEndpointMethodTypes) => {
      const providerToken = await this.getUserProviderToken();
      const pullRequests = await providerToken.rest.issues.listForRepo({
        ...params,
      });
      return pullRequests.data;
    },
  );

  /**
   * Get User Repositories Pull Request (PR) from github
   * @param {PullRequestParameters} params - Parameters for the request
   * @returns Pull request from repository
   */
  public getUserRepositoriesPullRequest = cache(
    async (params: PullRequestParameters) => {
      try {
        const providerToken = await this.getUserProviderToken();
        const pullRequest = await providerToken.rest.pulls.get({
          ...params,
        });
        return pullRequest.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to get pull request");
      }
    },
  );

  /**
   * Get User Repositories Pull Request (PR) Files from github
   * @param {pullRequestsFilterParameters} params - Parameters for the request
   * @returns List of pull request files from repository
   */
  public getUserRepositoriesPullRequestFiles = cache(
    async (params: pullRequestsFilterParameters) => {
      const providerToken = await this.getUserProviderToken();
      const pullRequestFiles = await providerToken.rest.pulls.listFiles({
        ...params,
      });
      return pullRequestFiles.data;
    },
  );
}

export const githubService = async () => {
  const supabase = await createClient();
  return new GithubService(supabase);
};

export { GithubService };
