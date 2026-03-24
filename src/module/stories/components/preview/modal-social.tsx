"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import useModalStore from "../../stores/use-modal";
import { StoryPreviewContent } from "../story-preview-content";

/** พรีวิวแบบ modal — ใช้เฉพาะ viewport มือถือ (< md) */
export default function ModalSocial() {
  const exportRef = useRef<HTMLDivElement>(null);
  const setModal = useModalStore((s) => s.setModal);
  const modal = useModalStore((s) => s.modal);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile && modal === "preview") {
      setModal(null);
    }
  }, [isMobile, modal, setModal]);

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

  const showPreviewModal = modal === "preview" && isMobile;

  return (
    <AnimatePresence mode="wait">
      {showPreviewModal && (
        <motion.div
          className="fixed inset-0 z-999 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={() => setModal(null)}
          >
            <XIcon className="size-4" />
          </Button>
          <motion.div
            className="max-h-[min(92dvh,920px)] w-full max-w-2xl overflow-y-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <StoryPreviewContent
              exportRef={exportRef}
              shareClassName="mt-4 max-w-sm mx-auto"
              showEmptyPlaceholder={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
