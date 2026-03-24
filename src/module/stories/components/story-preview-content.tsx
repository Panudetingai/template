"use client";

import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STORY_CANVAS_PRESETS } from "@/module/stories/components/socials/story-canvas-presets";
import { StoryShareActions } from "@/module/stories/components/socials/story-share-actions";
import { StorySocialCard } from "@/module/stories/components/socials/story-social-card";
import { getStoryCardTemplate } from "@/module/stories/components/story-card-templates";
import { useStoryGeneratorStore } from "@/module/stories/stores/use-story-generator";
import { useMemo } from "react";

type StoryPreviewContentProps = {
  exportRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  /** ลด margin บน desktop แถบข้าง */
  shareClassName?: string;
  /**
   * แสดงกล่องว่างก่อน generate — ปิดใน modal (มีแค่ loading / การ์ด)
   * @default true
   */
  showEmptyPlaceholder?: boolean;
};

function PreviewLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className="bg-muted/40 relative mx-auto flex aspect-9/16 w-full max-w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border/50"
        aria-busy
        aria-label="กำลังสร้างการ์ด"
      >
        <Loader />
        <Loader 
          variant="text-shimmer"
          text="Generating story card..."
        />
        <div className="absolute inset-x-4 bottom-10 w-[calc(100%-2rem)] space-y-2">
          <Skeleton className="mx-auto h-3 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  );
}

function PreviewEmptyPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "text-muted-foreground bg-muted/20 flex min-h-[min(650px,70vh)] items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm",
        className,
      )}
    >
      Generate from commit to see your card here.
    </div>
  );
}

/** พรีวิวการ์ด + ปุ่มแชร์/ดาวน์โหลด — ใช้ร่วมกันระหว่างแถบข้าง (desktop) กับ modal (mobile) */
export function StoryPreviewContent({
  exportRef,
  className,
  shareClassName,
  showEmptyPlaceholder = true,
}: StoryPreviewContentProps) {
  const templateId = useStoryGeneratorStore((s) => s.templateId);
  const aiPreview = useStoryGeneratorStore((s) => s.aiPreview);
  const isGenerating = useStoryGeneratorStore((s) => s.isGenerating);
  const template = useMemo(
    () => getStoryCardTemplate(templateId),
    [templateId],
  );

  const cardProps =
    aiPreview &&
    template.aiKind !== "none" &&
    aiPreview.variant === template.aiKind
      ? aiPreview.props
      : undefined;

  if (isGenerating) {
    return <PreviewLoadingSkeleton className={className} />;
  }

  if (!aiPreview && showEmptyPlaceholder) {
    return <PreviewEmptyPlaceholder className={className} />;
  }

  if (!aiPreview) {
    return null;
  }

  return (
    <div className={className}>
      <div ref={exportRef} className="w-full min-w-0">
        <StorySocialCard
          preset={template.preset}
          Card={template.Card}
          filename={template.filename}
          captureBackgroundColor={template.captureBackgroundColor}
          showMeta={false}
          cardProps={cardProps}
        />
      </div>
      <StoryShareActions
        className={
          shareClassName ?? "mt-4 max-w-sm mx-auto md:mx-0 md:max-w-none"
        }
        exportRef={exportRef}
        filename={template.filename}
        targetWidth={STORY_CANVAS_PRESETS[template.preset].exportWidth}
        backgroundColor={template.captureBackgroundColor}
      />
    </div>
  );
}
