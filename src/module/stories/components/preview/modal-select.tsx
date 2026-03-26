"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import useModalStore from "../../stores/use-modal";
import { useStoryGeneratorStore } from "../../stores/use-story-generator";
import { StorySocialCard } from "../socials/story-social-card";
import {
  STORY_CARD_TEMPLATES,
  type StoryCardTemplateId,
} from "../story-card-templates";

/** จำกัดความกว้างพรีวิวให้สูง 9:16 ไม่เกิน (100dvh - ช่อง chrome) — พอดีจอโดยไม่ scroll */
const previewShellStyle = {
  width:
    "min(100%, min(92vw, 440px), calc((100dvh - 15rem) * 9 / 16))",
} as CSSProperties;

function ModalSelectInner({ templateId }: { templateId: StoryCardTemplateId }) {
  const setModal = useModalStore((s) => s.setModal);
  const setTemplateId = useStoryGeneratorStore((s) => s.setTemplateId);

  const templates = STORY_CARD_TEMPLATES;
  const startIndex = Math.max(
    0,
    templates.findIndex((t) => t.id === templateId),
  );

  const [carouselIndex, setCarouselIndex] = useState(startIndex);
  const n = templates.length;

  useEffect(() => {
    setCarouselIndex(startIndex);
  }, [startIndex]);

  const goPrev = useCallback(() => {
    setCarouselIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    setCarouselIndex((i) => (i + 1) % n);
  }, [n]);

  const handleConfirm = useCallback(() => {
    const t = templates[carouselIndex];
    if (t) setTemplateId(t.id);
    setModal(null);
  }, [carouselIndex, setModal, setTemplateId, templates]);

  const activeTemplate = templates[carouselIndex];

  return (
    <motion.div
      className="flex h-full min-h-0 w-full max-w-3xl flex-col gap-2 overflow-hidden sm:gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="shrink-0 space-y-0.5 text-center sm:text-left">
        <h2 className="text-foreground text-lg font-semibold sm:text-xl">
          Select Story Card Template
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Scroll to preview and click confirm
        </p>
      </div>

      {activeTemplate ? (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 gap-x-2 sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground text-sm font-medium sm:text-base">
              {activeTemplate.label}
            </span>
            {activeTemplate.aiKind !== "none" ? (
              <Badge variant="secondary" className="text-[10px]">
                AI
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground line-clamp-1 max-w-[min(100%,18rem)] text-center text-[11px] sm:max-w-md sm:text-right sm:text-xs">
            {activeTemplate.description}
          </p>
        </div>
      ) : null}

      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden">
        <div className="mx-auto w-full shrink-0" style={previewShellStyle}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTemplate?.id ?? carouselIndex}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.9 }}
              transition={{ duration: 0.12 }}
              className="w-full"
            >
              {activeTemplate ? (
                <StorySocialCard
                  preset={activeTemplate.preset}
                  Card={activeTemplate.Card}
                  filename={activeTemplate.filename}
                  captureBackgroundColor={activeTemplate.captureBackgroundColor}
                  showMeta={false}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={goPrev}
          aria-label="เทมเพลตก่อนหน้า"
        >
          <ChevronLeft className="size-5" />
        </Button>

        <div className="flex max-w-[min(100%,240px)] flex-wrap items-center justify-center gap-1 sm:max-w-[280px] sm:gap-1.5">
          {templates.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCarouselIndex(i)}
              className={cn(
                "h-2 rounded-full transition-[width,background-color] duration-200 sm:h-2.5",
                i === carouselIndex
                  ? "w-7 bg-primary sm:w-8"
                  : "w-2 bg-muted hover:bg-muted-foreground/40 sm:w-2.5",
              )}
              aria-label={`${t.label} — สไลด์ ${i + 1}`}
              aria-current={i === carouselIndex}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={goNext}
          aria-label="เทมเพลตถัดไป"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="flex shrink-0 flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => setModal(null)}>
          Cancel
        </Button>
        <Button type="button" onClick={handleConfirm}>
          <CheckIcon className="size-4" />
          Use this template
        </Button>
      </div>
    </motion.div>
  );
}

export function ModalSelectCard() {
  const modal = useModalStore((s) => s.modal);
  const setModal = useModalStore((s) => s.setModal);
  const templateId = useStoryGeneratorStore((s) => s.templateId);

  return (
    <AnimatePresence mode="wait">
      {modal === "select" && (
        <motion.div
          className="fixed inset-0 z-999 flex h-dvh max-h-dvh flex-col overflow-hidden bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex min-h-0 flex-1 flex-col px-4 pt-12 pb-4 sm:justify-center sm:px-6 sm:pb-6 sm:pt-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 shrink-0 sm:top-4 sm:right-4"
              onClick={() => setModal(null)}
              aria-label="ปิด"
            >
              <XIcon className="size-4" />
            </Button>

            <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
              <ModalSelectInner key={templateId} templateId={templateId} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
