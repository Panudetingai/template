"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    BookIcon,
    BriefcaseIcon,
    HeartIcon,
    PaintbrushIcon,
    SmileIcon,
} from "lucide-react";
import { useGeneratorStore } from "../stores/use-generator";

const tones = [
  {
    name: "Professional",
    description: "For business and formal content",
    value: "professional",
    icon: BriefcaseIcon,
  },
  {
    name: "Casual",
    description: "For casual and friendly content",
    value: "casual",
    icon: SmileIcon,
  },
  {
    name: "Creative",
    description: "For creative and artistic content",
    value: "creative",
    icon: PaintbrushIcon,
  },
  {
    name: "Educational",
    description: "For educational and informative content",
    value: "educational",
    icon: BookIcon,
  },
  {
    name: "Motivational",
    description: "For motivational and inspiring content",
    value: "motivational",
    icon: HeartIcon,
  },
];

export default function SelectTone() {
  const selectedTone = useGeneratorStore((state) => state.selectedTone);
  const setSelectedTone = useGeneratorStore((state) => state.setSelectedTone);

  const handleSelectTone = (tone: string) => {
    if (selectedTone.includes(tone)) {
      setSelectedTone(selectedTone.filter((t) => t !== tone));
    } else {
      setSelectedTone([...selectedTone, tone]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Select Tone</h1>
        <p className="text-muted-foreground text-sm">
          Select the tone you want to generate posts for
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 justify-center items-center">
        {tones.map((tone) => (
          <Card
            key={tone.value}
            className={cn(
              "hover:bg-muted/50 transition-all duration-300 cursor-pointer",
              selectedTone.includes(tone.value)
                ? "bg-muted/50 border border-primary/50"
                : "",
            )}
            onClick={() => handleSelectTone(tone.value)}
          >
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-2 size-12 flex items-center justify-center mb-2">
                  <tone.icon className="size-6 text-primary" />
                </div>
                <div>
                  <p className="">{tone.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {tone.description}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
