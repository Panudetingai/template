"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/elysia/eden-client";
import { cn, colorLanguage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, GitBranch } from "lucide-react";
import { useGeneratorStepStore, useGeneratorStore } from "../stores/use-generator";

export default function RepoList() {
  const setSelectedRepository = useGeneratorStore((state) => state.setSelectedRepository);
  const setStep = useGeneratorStepStore((state) => state.setStep);

  const {
    data: repositories,
    isPending,
    error,
  } = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const response = await api.repositorie.get();
      if (response.error) {
        throw new Error(response.error.message as string);
      }
      return response.data.repositories;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  if (isPending) return <Skeletonloading />;
  if (error) return <div>Error: {error.message}</div>;

  const handleSelectRepository = (repository: { repositoryName: string; repositoryOwner: string; }) => {
    setSelectedRepository(repository);
    setStep(3, "select repository");
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      {repositories &&
        repositories.map((repository) => (
          <Card
            key={repository.id}
            className="hover:bg-foreground/5 transition-all duration-300 cursor-pointer"
            onClick={() => handleSelectRepository({
                repositoryName: repository.name,
                repositoryOwner: repository.owner.login,
            })}
          >
            <CardContent className="space-y-2 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <GitBranch />
                  </div>
                  <div>
                    <p>
                      {repository.name}{" "}
                      <Badge variant={"outline"} className="font-normal ml-2">
                        {repository.private ? "Private" : "Public"}
                      </Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {repository.default_branch}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {repository.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    colorLanguage(repository.language),
                    "size-2 rounded-full",
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {repository.language}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                updated{" "}
                {formatDistanceToNow(new Date(repository.updated_at || ""))}
              </span>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
}

const Skeletonloading = () => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
};
