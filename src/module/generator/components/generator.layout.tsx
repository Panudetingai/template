"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGeneratorStepStore,
  useGeneratorStore,
} from "../stores/use-generator";
import CommitList from "./commit-list";
import GeneratePreview from "./generate-preview";
import RepoList from "./repo-list";
import SelectPlatforms from "./select-platforms";
import SelectTone from "./select-tone";

export default function GeneratorLayout() {
  const router = useRouter();
  const stepPage = useGeneratorStepStore((state) => state.stepPage);
  const step = useGeneratorStepStore((state) => state.step);
  const setStep = useGeneratorStepStore((state) => state.setStep);
  const backStepPage = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1, stepPage);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      {step > 1 && (
        <div>
          <Button variant={"link"} className="px-0!" onClick={backStepPage}>
            <ArrowLeftIcon className="size-4" />
            Back to {stepPage.charAt(0).toUpperCase() + stepPage.slice(1)}
          </Button>
        </div>
      )}
      {step === 1 && <GeneratorSelectPlatformsandTone />}
      {step === 2 && <GeneratorSelectRepository />}
      {step === 3 && <GenerateSelectCommit />}
      {step === 4 && <GeneratePreview />}
    </div>
  );
}

export function GeneratorSelectPlatformsandTone() {
  const { selectedPlatforms, selectedTone } = useGeneratorStore();
  const setStep = useGeneratorStepStore((state) => state.setStep);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SelectPlatforms />
        <SelectTone />
        {selectedPlatforms.length > 0 && selectedTone.length > 0 && (
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="border p-4 rounded bg-accent text-accent-foreground text-sm">
              Will generate{" "}
              <span className="font-bold">
                {selectedPlatforms.length + selectedTone.length} Posts
              </span>{" "}
              ({selectedPlatforms.length} platforms x {selectedTone.length}{" "}
              tones)
            </div>
          </motion.div>
        )}
        <Button
          className="w-full"
          size={"lg"}
          onClick={() => setStep(2, "select platform and tone")}
          suppressHydrationWarning
          disabled={(selectedPlatforms.length === 0 || selectedTone.length === 0)}
        >
          Continue to Select Repository <ArrowRightIcon className="size-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

export function GeneratorSelectRepository() {
  const selectedPlatforms = useGeneratorStore(
    (state) => state.selectedPlatforms,
  );
  const selectedTone = useGeneratorStore((state) => state.selectedTone);
  return (
    <motion.div>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">Select Repository</h1>
          <p className="text-muted-foreground text-sm">
            Select the repository you want to generate posts for
          </p>
        </div>
        <Card>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full flex gap-2 items-center">
                <p>Platforms Selected: </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.map((platform) => (
                    <Badge key={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="w-full flex gap-2 items-center">
                <p>Tones Selected: </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTone.map((tone) => (
                    <Badge key={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm mt-4">
              {selectedPlatforms.length + selectedTone.length} Posts will be
              generated
            </p>
          </CardContent>
        </Card>
        <RepoList />
      </div>
    </motion.div>
  );
}
export function GenerateSelectCommit() {
  const selectedRepository = useGeneratorStore(
    (state) => state.selectedRepository,
  );
  return (
    <motion.div>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">
            Select Commit for {selectedRepository.repositoryName} by{" "}
            {selectedRepository.repositoryOwner}
          </h1>
          <p className="text-muted-foreground text-sm">
            Select one or more commits (click again to deselect)
          </p>
        </div>
        <CommitList />
      </div>
    </motion.div>
  );
}
