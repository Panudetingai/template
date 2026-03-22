import { create } from "zustand";

interface GeneratorStore {
    selectedPlatforms: string[];
    selectedTone: string[];
    setSelectedPlatforms: (platforms: string[]) => void;
    setSelectedTone: (tone: string[]) => void;
}

const useGeneratorStore = create<GeneratorStore>((set) => ({
    selectedPlatforms: [],
    selectedTone: [],
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
