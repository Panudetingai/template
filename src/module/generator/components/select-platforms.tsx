"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, TwitterIcon } from "lucide-react";
import { Platform, useGeneratorStore } from "../stores/use-generator";

const platforms = [
  {
    name: "Twitter",
    description: "short & punchy",
    icon: TwitterIcon,
    value: "twitter",
  },
  {
    name: "Facebook",
    description: "friendly & engaging",
    icon: FacebookIcon,
    value: "facebook",
  },
  {
    name: "Instagram",
    description: "visual & creative",
    icon: InstagramIcon,
    value: "instagram",
  },
];

export default function SelectPlatforms() {
  const selectedPlatforms = useGeneratorStore((state) => state.selectedPlatforms);
  const setSelectedPlatforms = useGeneratorStore((state) => state.setSelectedPlatforms);

  const handleSelectPlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-semibold">Select Platforms</h1>
        <p className="text-muted-foreground text-sm">
          Select the platforms you want to generate posts for
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 justify-center items-center">
        {platforms.map((platform, index) => (
          <Card
            key={index}
            className={cn("hover:bg-muted/50 transition-all duration-300 cursor-pointer", selectedPlatforms.includes(platform.value as Platform) ? "bg-muted/50 border border-primary/50" : "")}
            onClick={() => handleSelectPlatform(platform.value as Platform)}
          >
            <CardContent className="flex flex-col items-center justify-center h-35 max-sm:p-2!">
              <div className="bg-primary/10 rounded-full p-2 size-12 flex items-center justify-center mb-2">
                <platform.icon className="size-6 text-primary" />
              </div>
              <p className="text-sm text-center">{platform.name}</p>
              <span className="text-muted-foreground text-xs text-center">{platform.description}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
