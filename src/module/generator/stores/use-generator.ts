import { create } from "zustand";

export type Platform = 'twitter' | 'facebook' | 'instagram'
export type Tone = 'professional' | 'casual' | 'technical' | 'creative' | 'academic' | 'marketing' | 'news' | 'entertainment' | 'lifestyle' | 'sports' | 'technology' | 'science' | 'health' | 'business' | 'finance' | 'politics' | 'religion' | 'philosophy' | 'history' | 'art' | 'music' | 'film' | 'tv' | 'gaming' | 'food' | 'travel' | 'fashion' | 'beauty' | '家居' | '其他'

interface GeneratorStore {
  selectedPlatforms: Platform[];
  selectedTone: Tone[];
  selectedRepository: {
    repositoryName: string;
    repositoryOwner: string;
  };
  selectedCommit: {
    commits: {
      commitMessage: string;
      commitSha: string;
      commitAuthor: string;
      commitDate: string;
    }[];
  };
  setSelectedCommit: (
    commits: {
      commitMessage: string;
      commitSha: string;
      commitAuthor: string;
      commitDate: string;
    }[],
  ) => void;
  toggleCommit: (commit: {
    commitMessage: string;
    commitSha: string;
    commitAuthor: string;
    commitDate: string;
  }) => void;
  setSelectedRepository: (repository: {
    repositoryName: string;
    repositoryOwner: string;
  }) => void;
  setSelectedPlatforms: (platforms: Platform[]) => void;
  setSelectedTone: (tone: Tone[]) => void;
}

const useGeneratorStore = create<GeneratorStore>((set) => ({
  selectedPlatforms: [],
  selectedTone: [],
  selectedRepository: {
    repositoryName: "",
    repositoryOwner: "",
  },
  selectedCommit: {
    commits: [],
  },
  setSelectedCommit: (commits) =>
    set({ selectedCommit: { commits } }),

  toggleCommit: (commit) =>
    set((state) => {
      const exists = state.selectedCommit.commits.some(
        (c) => c.commitSha === commit.commitSha,
      );
      const commits = exists
        ? state.selectedCommit.commits.filter(
            (c) => c.commitSha !== commit.commitSha,
          )
        : [...state.selectedCommit.commits, commit];
      return { selectedCommit: { commits } };
    }),
  setSelectedRepository: (repository) =>
    set({ selectedRepository: repository }),
  setSelectedPlatforms: (platforms) => set({ selectedPlatforms: platforms }),
  setSelectedTone: (tones) => set({ selectedTone: tones }),
}));

interface GeneratorStep {
  step: number;
  setStep: (step: number) => void;
}

const useGeneratorStepStore = create<GeneratorStep>((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
}));

export { useGeneratorStepStore, useGeneratorStore };
