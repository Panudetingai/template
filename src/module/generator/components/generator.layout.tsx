"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { useGeneratorStepStore, useGeneratorStore } from "../stores/use-generator";
import SelectPlatforms from "./select-platforms";
import SelectTone from "./select-tone";

export default function GeneratorLayout() {
  const step = useGeneratorStepStore((state) => state.step);
  return (
    <div className="flex flex-col gap-4">
      {step === 1 && <GeneratorSelectPlatformsandTone />}
      {step === 2 && <GeneratorSelectRepository />}
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
          onClick={() => setStep(2)}
          disabled={selectedPlatforms.length === 0 || selectedTone.length === 0}
        >
          Continue to Select Repository <ArrowRightIcon className="size-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

export function GeneratorSelectRepository() {
  const selectedPlatforms = useGeneratorStore((state) => state.selectedPlatforms);
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
              <Badge key={platform}>{platform}</Badge>
            ))}
          </div>
        </div>
        <div className="w-full flex gap-2 items-center">
          <p>Tones Selected: </p>
          <div className="flex flex-wrap gap-2">
            {selectedTone.map((tone) => (
              <Badge key={tone}>{tone}</Badge>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm mt-4">{selectedPlatforms.length + selectedTone.length} Posts will be generated</p>
    </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
