"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/elysia/eden-client";
import { assertEdenOk } from "@/lib/elysia/eden-response";
import { cn } from "@/lib/utils";
import {
  storyCardBasicAiToCardProps,
  type StoryCardBasicAi,
} from "@/module/generator/services/types/story-card-basic";
import {
  storyCardGlassAiToCardProps,
  type StoryCardGlassAi,
} from "@/module/generator/services/types/story-card-glass";
import {
  getStoryCardTemplate
} from "@/module/stories/components/story-card-templates";
import type { StoryGeneratorAiPreview } from "@/module/stories/components/story-generator-preview";
import {
  useStoryGeneratorStore,
  type StoryCommitSelection,
} from "@/module/stories/stores/use-story-generator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, GitBranch, Loader2, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import useModalStore from "../stores/use-modal";
import { SelectCardStory } from "./panels/select-card";

/** แผงหลัก: เลือก repo / commit / เทมเพลต + generate story card (Basic / Glass) */
export function StoryGeneratorPanel() {
  const setModal = useModalStore((s) => s.setModal);
  const repo = useStoryGeneratorStore((s) => s.repo);
  const selectedCommits = useStoryGeneratorStore((s) => s.selectedCommits);
  const templateId = useStoryGeneratorStore((s) => s.templateId);
  const extraPrompt = useStoryGeneratorStore((s) => s.extraPrompt);
  const setRepo = useStoryGeneratorStore((s) => s.setRepo);
  const setSelectedCommits = useStoryGeneratorStore((s) => s.setSelectedCommits);
  const setTemplateId = useStoryGeneratorStore((s) => s.setTemplateId);
  const setExtraPrompt = useStoryGeneratorStore((s) => s.setExtraPrompt);
  const setAiPreview = useStoryGeneratorStore((s) => s.setAiPreview);
  const toggleCommit = useStoryGeneratorStore((s) => s.toggleCommit);

  const template = useMemo(
    () => getStoryCardTemplate(templateId),
    [templateId],
  );

  const {
    data: repositories,
    isPending: reposLoading,
    error: reposError,
  } = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const response = await api.repositorie.get();
      if (response.error) {
        throw new Error(String(response.error.message));
      }
      return response.data.repositories;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { isPending: commitsLoading, data: commits } = useQuery({
    queryKey: ["commits", repo?.repositoryOwner, repo?.repositoryName],
    queryFn: async () => {
      if (!repo) return null;
      const response =
        await api.repositorie[repo.repositoryOwner][
          repo.repositoryName
        ].commits.get();
      if (response.error) {
        throw new Error(String(response.error.message));
      }
      return response.data.commits;
    },
    enabled: !!repo,
  });

  const toCommitData = (
    commit: NonNullable<typeof commits>[number],
  ): StoryCommitSelection => ({
    commitMessage: commit.commit.message,
    commitSha: commit.sha,
    commitAuthor: commit.commit.author?.name ?? "",
    commitDate: commit.commit.author?.date ?? "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (): Promise<StoryGeneratorAiPreview> => {
      if (!repo || selectedCommits.length === 0) {
        throw new Error("เลือก repository และ commit อย่างน้อยหนึ่งรายการ");
      }
      if (template.aiKind === "none") {
        throw new Error("เทมเพลตนี้ยังไม่มี AI — เลือก Wrapped หรือ Glass");
      }

      const body = {
        repository: repo,
        commit: selectedCommits,
        prompt: extraPrompt.trim() || undefined,
      };

      if (template.aiKind === "basic") {
        const data = assertEdenOk<StoryCardBasicAi>(
          await api.generator.storyCardBasic.post(body),
        );
        return {
          variant: "basic",
          props: storyCardBasicAiToCardProps(data),
        };
      }

      if (template.aiKind === "glass") {
        const data = assertEdenOk<StoryCardGlassAi>(
          await api.generator.storyCardGlass.post(body),
        );
        return {
          variant: "glass",
          props: storyCardGlassAiToCardProps(data),
        };
      }

      throw new Error("ไม่รองรับเทมเพลตนี้");
    },
    onSuccess: (data) => {
      setAiPreview(data);
      setModal("preview");
      toast.success("สร้างการ์ดแล้ว");

    },
    onError: (e: Error) => {
      toast.error(e.message ?? "สร้างการ์ดไม่สำเร็จ");
    },
  });

  return (
    <section className="">
      <div className="space-y-1">
        <h2 className="text-foreground text-sm font-semibold">
          สร้าง Story จาก GitHub + เลือกเทมเพลต
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          เลือก repo → เลือก commit (หลายอันได้) → เลือกสไตล์การ์ด → โน้ตเพิ่มได้
          — AI เติม copy ได้ที่เทมเพลต{" "}
          <span className="text-foreground font-medium">Wrapped</span> และ{" "}
          <span className="text-foreground font-medium">Glass</span>
        </p>
      </div>

      <Separator className="my-6" />

      {!repo ? (
        <div className="space-y-3">
          <Label className="text-foreground text-xs font-medium uppercase tracking-wide">
            1 · เลือก Repository
          </Label>
          {reposLoading ? (
            <div className="flex max-h-[min(480px,55dvh)] flex-col gap-2 overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-28 w-full shrink-0 rounded-lg" />
              ))}
            </div>
          ) : reposError ? (
            <p className="text-destructive text-sm">
              {(reposError as Error).message}
            </p>
          ) : (
            <div
              className={cn(
                "max-h-[min(480px,55dvh)] overflow-y-auto overscroll-y-contain p-4",
                "scroll-smooth [scrollbar-gutter:stable]",
              )}
            >
              <div className="flex flex-col gap-2">
                {repositories?.map((r) => (
                  <Card
                    key={r.id}
                    className="hover:bg-foreground/5 shrink-0 cursor-pointer transition-colors"
                    onClick={() => {
                      setRepo({
                        repositoryName: r.name,
                        repositoryOwner: r.owner.login,
                      });
                    }}
                  >
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
                          <GitBranch className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {r.name}
                            <Badge variant="outline" className="ml-2 font-normal">
                              {r.private ? "Private" : "Public"}
                            </Badge>
                          </p>
                          <p className="text-muted-foreground truncate text-sm">
                            {r.description ?? r.default_branch}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Repo · </span>
              <span className="font-medium">
                {repo.repositoryOwner}/{repo.repositoryName}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRepo(null)}
            >
              เปลี่ยน repo
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground text-xs font-medium uppercase tracking-wide">
              2 · เลือก Commit
            </Label>
            {commitsLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-normal">
                    {selectedCommits.length} / {commits?.length ?? 0} เลือก
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto px-2 py-0"
                      onClick={() =>
                        setSelectedCommits(
                          commits?.map((c) => toCommitData(c)) ?? [],
                        )
                      }
                    >
                      เลือกทั้งหมด
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto px-2 py-0"
                      onClick={() => setSelectedCommits([])}
                    >
                      ล้าง
                    </Button>
                  </div>
                </div>
                <div className="max-h-[min(360px,50vh)] space-y-2 overflow-y-auto p-2 pr-1">
                  {commits?.map((commit) => {
                    const row = toCommitData(commit);
                    const isSelected = selectedCommits.some(
                      (c) => c.commitSha === row.commitSha,
                    );
                    return (
                      <Card
                        key={commit.sha}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected && "border-primary/50 bg-muted/40",
                        )}
                        onClick={() => toggleCommit(row)}
                      >
                        <CardContent>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleCommit(row)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                            <div className="min-w-0 flex-1 space-y-2">
                              <p className="line-clamp-2 text-sm leading-snug">
                                {commit.commit.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="font-mono text-[10px]"
                                >
                                  {commit.sha.slice(0, 7)}
                                </Badge>
                                <span className="text-muted-foreground text-xs">
                                  {formatDistanceToNow(
                                    new Date(
                                      commit.commit.author?.date ?? "",
                                    ),
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <SelectCardStory />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-extra-prompt">
              โน้ตเพิ่มให้ AI (ไม่บังคับ)
            </Label>
            <Textarea
              id="story-extra-prompt"
              rows={3}
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder="เช่น เน้นโทน funny หรือเล่าเรื่อง refactor มากกว่า feature"
              className="text-sm"
            />
          </div>

          <Button
            type="button"
            disabled={
              isPending ||
              selectedCommits.length === 0 ||
              template.aiKind === "none"
            }
            onClick={() => mutate()}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {template.aiKind !== "none"
              ? "Generate จาก commit"
              : "สไตล์นี้ยังไม่มี AI"}
          </Button>
          {template.aiKind === "none" ? (
            <p className="text-muted-foreground text-[11px]">
              พรีวิวเป็น layout คงที่ — ใช้ AI ได้เมื่อเลือกเทมเพลต Wrapped หรือ Glass
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

export const StoryAiBasicDemo = StoryGeneratorPanel;
