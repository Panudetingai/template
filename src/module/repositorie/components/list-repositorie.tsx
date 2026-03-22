"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/elysia/eden-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CircleDot, GitBranch, GitFork, Star } from "lucide-react";
import { useSearchRepositorie } from "../stores/use-search";
function colorLanguage(language: string | null) {
  switch (language) {
    case "JavaScript":
      return "bg-yellow-500";
    case "TypeScript":
      return "bg-blue-500";
    case "Python":
      return "bg-green-500";
    case "Java":
      return "bg-red-500";
    case "C++":
      return "bg-purple-500";
    case "C#":
      return "bg-orange-500";
    case "Ruby":
      return "bg-pink-500";
    case "PHP":
      return "bg-purple-500";
    case "Swift":
      return "bg-teal-500";
    case "Kotlin":
      return "bg-indigo-500";
    case "HTML":
      return "bg-red-500";
    case "CSS":
      return "bg-blue-500";
    case "SQL":
      return "bg-green-500";
    case "Shell":
      return "bg-purple-500";
    case "PowerShell":
      return "bg-purple-500";
    case "Rust":
      return "bg-orange-500";
  }
  return "bg-gray-500";
}

export default function ListRepositories() {
  const repositories = useSearchRepositorie((s) => s.repositories);
  const filteredRepositories = useSearchRepositorie(
    (s) => s.filteredRepositories,
  );
  const setRepositories = useSearchRepositorie((s) => s.setRepositories);
  const { isLoading } = useQuery({
    queryKey: ["get-repositorie-list"],
    queryFn: async () => {
      const repositorie = await api.repositorie.get();
      if (!repositorie.data?.repositories)
        throw new Error("Failed to get repositorie list");
      setRepositories(repositorie.data.repositories);
      return repositorie.data.repositories;
    },
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
              <p className="text-sm text-muted-foreground">
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
                Updated{" "}
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
