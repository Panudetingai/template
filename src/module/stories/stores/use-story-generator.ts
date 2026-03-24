import { create } from "zustand";

import type { StoryCardTemplateId } from "@/module/stories/components/story-card-templates";
import type { StoryGeneratorAiPreview } from "@/module/stories/components/story-generator-preview";

export type StorySelectedRepo = {
  repositoryName: string;
  repositoryOwner: string;
};

export type StoryCommitSelection = {
  commitMessage: string;
  commitSha: string;
  commitAuthor: string;
  commitDate: string;
};

interface StoryGeneratorStore {
  repo: StorySelectedRepo | null;
  selectedCommits: StoryCommitSelection[];
  templateId: StoryCardTemplateId;
  extraPrompt: string;
  aiPreview: StoryGeneratorAiPreview | null;

  setRepo: (repo: StorySelectedRepo | null) => void;
  setSelectedCommits: (commits: StoryCommitSelection[]) => void;
  toggleCommit: (c: StoryCommitSelection) => void;
  setTemplateId: (id: StoryCardTemplateId) => void;
  setExtraPrompt: (value: string) => void;
  setAiPreview: (preview: StoryGeneratorAiPreview | null) => void;
}

const useStoryGeneratorStore = create<StoryGeneratorStore>((set) => ({
  repo: null,
  selectedCommits: [],
  templateId: "basic",
  extraPrompt: "",
  aiPreview: null,

  setRepo: (repo) =>
    set({
      repo,
      selectedCommits: [],
      aiPreview: null,
    }),

  setSelectedCommits: (commits) => set({ selectedCommits: commits }),

  toggleCommit: (c) =>
    set((state) => {
      const exists = state.selectedCommits.some((x) => x.commitSha === c.commitSha);
      if (exists) {
        return {
          selectedCommits: state.selectedCommits.filter(
            (x) => x.commitSha !== c.commitSha,
          ),
        };
      }
      return { selectedCommits: [...state.selectedCommits, c] };
    }),

  setTemplateId: (templateId) => set({ templateId, aiPreview: null }),

  setExtraPrompt: (extraPrompt) => set({ extraPrompt }),

  setAiPreview: (aiPreview) => set({ aiPreview }),
}));

export { useStoryGeneratorStore };
