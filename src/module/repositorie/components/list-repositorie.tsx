"use client";

import { handleLinkProvider } from "@/components/apps/sidebar/handles/linkprovider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/elysia/eden-client";
import { cn, colorLanguage } from "@/lib/utils";
import useIdentities from "@/stores/use-Identities";
import { Github } from "@lobehub/icons";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CircleDot, GitBranch, GitFork, Star } from "lucide-react";
import { useSearchRepositorie } from "../stores/use-search";

export default function ListRepositories() {
  const repositories = useSearchRepositorie((s) => s.repositories);
  const filteredRepositories = useSearchRepositorie(
    (s) => s.filteredRepositories,
  );
  const identities = useIdentities((s) => s.identities);
  const setRepositories = useSearchRepositorie((s) => s.setRepositories);

  const github = identities
    .filter((i) => i.provider === "github")
    .sort(
      (a, b) =>
        new Date(b.last_sign_in_at ?? 0).getTime() -
        new Date(a.last_sign_in_at ?? 0).getTime(),
    )[0];
  const { isLoading } = useQuery({
    queryKey: ["get-repositorie-list"],
    queryFn: async () => {
      const repositorie = await api.repositorie.get();
      if (!repositorie.data?.repositories)
        throw new Error(repositorie.error?.message as string);
      setRepositories(repositorie.data.repositories);
      return repositorie.data.repositories;
    },
    retry: (failureCount: number, error) =>
      error.message === "Provider token not found" ? false : failureCount < 3,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!repositories.length) {
    return (
      <div className="w-full space-y-4 h-52 flex items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h1 className="font-semibold">No repositories found</h1>
          <p className="text-muted-foreground text-sm text-center">
            You don&apos;t have any repositories connected to your account.
          </p>
          {!github && (
            <Button
              onClick={() => handleLinkProvider("github")}
              variant={"outline"}
              size={"lg"}
              className="w-full"
            >
              <Github size={20} />
              Connect GitHub
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <span className="text-sm text-muted-foreground">
        Showing {filteredRepositories.length} of {repositories.length}{" "}
        repositorie
      </span>
      <div className="flex flex-col gap-4 mt-4">
        {filteredRepositories.map((repository) => (
          <Card
            key={repository.id}
            className="hover:bg-muted/50 transition-all duration-300 cursor-pointer"
            onClick={() => window.open(repository.html_url, "_blank")}
          >
            <CardContent className="space-y-2">
              <div className="flex space-x-4 items-center">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GitBranch />
                </div>
                <div>
                  <Label>
                    {repository.name}{" "}
                    <Badge className="font-normal ml-2" variant={"outline"}>
                      {repository.private ? "Private" : "Public"}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {repository.default_branch}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {repository.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-4 items-center text-muted-foreground">
                <div className="lang flex gap-2 items-center">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      colorLanguage(repository.language ?? null),
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    {repository.language ?? "Unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="size-4" />
                  <p className="text-sm text-muted-foreground">
                    {repository.stargazers_count}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="size-4" />
                  <p className="text-sm text-muted-foreground">
                    {repository.forks_count}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CircleDot className="size-4" />
                  <p className="text-sm text-muted-foreground">
                    {repository.open_issues_count}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(repository.updated_at ?? ""), {
                  addSuffix: true,
                })}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
