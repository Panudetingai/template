"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/elysia/eden-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import type { Platform } from "../stores/use-generator";
import { useGeneratorStepStore, useGeneratorStore } from "../stores/use-generator";
import {
  usePreviewStore,
  type PreviewPosts,
} from "../stores/use-preview";

export default function CommitList() {
  const setStep = useGeneratorStepStore((state) => state.setStep);
  const selectedRepository = useGeneratorStore(
    (state) => state.selectedRepository,
  );
  const selectedPlatforms = useGeneratorStore(
    (state) => state.selectedPlatforms,
  );
  const selectedTones = useGeneratorStore((state) => state.selectedTone);
  const selectedCommit = useGeneratorStore((state) => state.selectedCommit);
  const setSelectedCommit = useGeneratorStore(
    (state) => state.setSelectedCommit,
  );
  const toggleCommit = useGeneratorStore((state) => state.toggleCommit);
  const setPosts = usePreviewStore((state) => state.setPosts);
  const { isPending, data: commits } = useQuery({
    queryKey: [
      "commits",
      selectedRepository.repositoryOwner,
      selectedRepository.repositoryName,
    ],
    queryFn: async () => {
      const response =
        await api.repositorie[selectedRepository.repositoryOwner][
          selectedRepository.repositoryName
        ].commits.get();
      if (response.error) throw new Error(response.error.message as string);
      return response.data.commits;
    },
  });

  const { mutate: handleGeneratePosts, isPending: isGeneratingPosts } =
    useMutation({
      mutationFn: async () => {
        const response = await api.generator.posts.post({
          platforms: selectedPlatforms,
          tones: selectedTones,
          repository: selectedRepository,
          commit: selectedCommit.commits,
        });
        if (response.error) throw new Error(response.error.message as string);
        const posts: PreviewPosts = {
          twitter: null,
          facebook: null,
          instagram: null,
        };
        for (const item of response.data) {
          const platform = item.platform as Platform;
          if (platform in posts) {
            posts[platform] = {
              content: item.content,
            };
          }
        }
        setPosts(posts);
        setStep(4, "select commits");
        return response.data;
      },
    });

  if (isPending) return <SkeletonCommitList />;

  const handleToggleCommit = (commit: {
    commitMessage: string;
    commitSha: string;
    commitAuthor: string;
    commitDate: string;
  }) => {
    toggleCommit(commit);
  };

  const handleSelectAll = () => {
    setSelectedCommit(commits?.map((commit) => toCommitData(commit)) ?? []);
  };

  const handleSelectNone = () => {
    setSelectedCommit([]);
  };

  const toCommitData = (commit: NonNullable<typeof commits>[number]) => ({
    commitMessage: commit.commit.message,
    commitSha: commit.sha,
    commitAuthor: commit.commit.author?.name ?? "",
    commitDate: commit.commit.author?.date ?? "",
  });

  return (
    <div className="flex flex-col gap-4">
      <Button
        disabled={
          selectedPlatforms.length === 0 ||
          selectedCommit.commits.length === 0 ||
          isGeneratingPosts
        }
        size={"lg"}
        className="cursor-pointer"
        onClick={() => handleGeneratePosts()}
      >
        {isGeneratingPosts ? (
          <>
            <Spinner />
            Generating Posts...
          </>
        ) : (
          <>
            Generate {selectedPlatforms.length} Posts from{" "}
            {selectedCommit.commits.length} Commits
          </>
        )}
      </Button>
      <div className="flex justify-between">
        {selectedCommit.commits.length === commits?.length ? (
          <Button
            variant={"link"}
            size={"sm"}
            onClick={() => handleSelectNone()}
          >
            Delete Select
          </Button>
        ) : (
          <Button
            variant={"link"}
            size={"sm"}
            onClick={() => handleSelectAll()}
          >
            Select All
          </Button>
        )}
        <Badge variant={"outline"} className="font-normal">
          {selectedCommit.commits.length} / {commits?.length}
        </Badge>
      </div>
      {commits &&
        commits.map((commit) => {
          const isSelected = selectedCommit.commits.some(
            (c) => c.commitSha === commit.sha,
          );
          return (
            <motion.div key={commit.sha}>
              <Card
                onClick={() => handleToggleCommit(toCommitData(commit))}
                className={isSelected ? "border-primary/50 bg-muted/50" : ""}
              >
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() =>
                        handleToggleCommit(toCommitData(commit))
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex flex-col gap-2">
                      <p className="leading-tight">{commit.commit.message}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Badge variant="secondary" className="font-normal">
                          {commit.sha.slice(0, 7)}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(commit.commit.author?.date ?? ""),
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
    </div>
  );
}

export function SkeletonCommitList() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-10 rounded-md" />
      ))}
    </div>
  );
}
