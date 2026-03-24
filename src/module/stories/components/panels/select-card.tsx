'use client';

import { Button } from "@/components/ui/button";
import { Flower2Icon } from "lucide-react";
import useModalStore from "../../stores/use-modal";
import { useStoryGeneratorStore } from "../../stores/use-story-generator";
import { STORY_CARD_TEMPLATES } from "../story-card-templates";

export function SelectCardStory() {
    const templateId = useStoryGeneratorStore((s) => s.templateId);
    const setTemplateId = useStoryGeneratorStore((s) => s.setTemplateId);
    const setModal = useModalStore((s) => s.setModal);
    const templates = STORY_CARD_TEMPLATES;
    return (
        <Button variant="outline" size="lg" className="w-full" onClick={() => setModal("select")}>
            <Flower2Icon className="size-4" />
            Select Story Card
        </Button>
    )
}