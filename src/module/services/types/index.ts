import { Endpoints } from "@octokit/types";

export type RepositoryResponse = Endpoints['GET /user/repos']['response']['data'][number];

export type RestEndpointMethodTypes = Endpoints['GET /repos/{owner}/{repo}/issues']['parameters'];

export type PullRequestParameters = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['parameters'];

export type pullRequestsFilterParameters = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/files']['parameters'];