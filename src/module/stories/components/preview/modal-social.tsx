"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import useModalStore from "../../stores/use-modal";
import { useStoryGeneratorStore } from "../../stores/use-story-generator";
import { STORY_CANVAS_PRESETS } from "../socials/story-canvas-presets";
import { StoryShareActions } from "../socials/story-share-actions";
import { StorySocialCard } from "../socials/story-social-card";
import { getStoryCardTemplate } from "../story-card-templates";

export default function ModalSocial() {
  const exportRef = useRef<HTMLDivElement>(null);
  const templateId = useStoryGeneratorStore((s) => s.templateId);
  const aiPreview = useStoryGeneratorStore((s) => s.aiPreview);
  const setModal = useModalStore((s) => s.setModal);
  const modal = useModalStore((s) => s.modal);
  const template = useMemo(
    () => getStoryCardTemplate(templateId),
    [templateId],
  );

  useEffect(() => {
    if (modal === "preview" || modal === "select") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  return (
    <AnimatePresence mode="wait">
      {modal === "preview" && (
        <motion.div
          className="fixed inset-0 z-999 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => setModal(null)}
          >
            <XIcon className="size-4" />
          </Button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-2xl mx-auto">
              <div
                ref={exportRef as React.RefObject<HTMLDivElement>}
                className="w-full min-w-0"
              >
                <StorySocialCard
                  preset={template.preset}
                  Card={template.Card}
                  filename={template.filename}
                  captureBackgroundColor={template.captureBackgroundColor}
                  showMeta={false}
                  cardProps={
                    aiPreview &&
                    template.aiKind !== "none" &&
                    aiPreview.variant === template.aiKind
                      ? aiPreview.props
                      : undefined
                  }
                />
              </div>
              <div className="space-y-3">
                <StoryShareActions
                  className="mt-4 max-w-sm mx-auto"
                  exportRef={exportRef}
                  filename={template.filename}
                  targetWidth={
                    STORY_CANVAS_PRESETS[template.preset].exportWidth
                  }
                  backgroundColor={template.captureBackgroundColor}
                />
                {template.aiKind !== "none" && !aiPreview ? (
                  <p className="text-muted-foreground text-center text-[11px]">
                    เลือก commit แล้วกด Generate เพื่อเติมข้อความ
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
