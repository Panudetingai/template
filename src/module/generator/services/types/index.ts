import z from "zod";
import { Platform, Tone } from "../../stores/use-generator";

export * from "./story-card-basic";
export * from "./story-card-glass";
export * from "./story-card-github-request";

export const generatedPostsRequestSchema = z.object({
    platforms: z.array(z.custom<Platform>()),
    tones: z.array(z.custom<Tone>()),
    repository: z.object({
        repositoryName: z.string(),
        repositoryOwner: z.string(),
    }),
    commit: z.array(z.object({
        commitMessage: z.string(),
        commitSha: z.string(),
        commitAuthor: z.string(),
        commitDate: z.string(),
    })),
})

export type GeneratedPostsRequest = z.infer<typeof generatedPostsRequestSchema>;