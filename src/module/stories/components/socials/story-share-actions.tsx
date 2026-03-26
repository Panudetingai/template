"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFontEmbedCSS, toPng } from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * สำรองเมื่อ getFontEmbedCSS ว่าง — ฝัง Inter จาก public (ชื่อครอบครัว "Inter")
 * ไม่แทนที่ @font-face ของ next/font โดยตรง
 */
function getInterFallbackFontEmbedCSS(): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const normal = `${origin}/fonts/Inter/Inter-VariableFont_opsz,wght.ttf`;
  const italic = `${origin}/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf`;
  return `
@font-face {
  font-family: "Inter";
  src: url("${normal}") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("${italic}") format("truetype");
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}`.trim();
}

type StoryShareActionsProps = {
  exportRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  className?: string;
  /** Target logical width for export (e.g. 1080 story, 1200 OG) */
  targetWidth?: number;
  /** Solid background for transparent edges in PNG */
  backgroundColor?: string;
};

/** Export PNG at target width, then share or download (จากพรีวิวใน DOM). */
export function StoryShareActions({
  exportRef,
  filename = "dayily-story.png",
  className,
  targetWidth = 1080,
  backgroundColor = "#0d0d0d",
}: StoryShareActionsProps) {
  const [busy, setBusy] = useState(false);

  const capture = useCallback(async () => {
    const el = exportRef.current;
    if (!el) {
      toast.error("ไม่พบพื้นที่สำหรับส่งออก");
      return null;
    }
    await document.fonts.ready;
    const w = el.offsetWidth;
    if (w < 1) return null;
    const pixelRatio = Math.min(targetWidth / w, 4);
    // ดึง @font-face จากสไตล์ชีตจริง (รวมชื่อครอบครัวแบบ scoped ของ next/font)
    // อย่าแทนที่ด้วยแค่ "Inter" อย่างเดียว — จะไม่ตรงกับที่หน้า render
    let fontEmbedCSS = await getFontEmbedCSS(el, { cacheBust: true });
    if (!fontEmbedCSS.trim()) {
      fontEmbedCSS = getInterFallbackFontEmbedCSS();
    }
    const dataUrl = await toPng(el, {
      pixelRatio: pixelRatio * 3,
      cacheBust: true,
      backgroundColor,
      fontEmbedCSS,
    });
    return dataUrl;
  }, [exportRef, targetWidth, backgroundColor]);

  const triggerDownload = useCallback((dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }, [filename]);

  const onDownload = useCallback(async () => {
    setBusy(true);
    try {
      await document.fonts.ready;

      const dataUrl = await capture();
      if (!dataUrl) return;
      triggerDownload(dataUrl);
      toast.success("ดาวน์โหลดรูปแล้ว — นำไปโพสต์ใน Story ได้เลย");
    } catch (e) {
      console.error(e);
      toast.error("ส่งออกรูปไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }, [capture, triggerDownload]);

  const onShare = useCallback(async () => {
    setBusy(true);
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Dayily Story",
          text: "แชร์จาก Dayily",
        });
        toast.success("เปิดตัวเลือกแชร์แล้ว");
        return;
      }

      triggerDownload(dataUrl);
      toast.message(
        "เบราว์เซอร์นี้ไม่รองรับแชร์ไฟล์โดยตรง — ดาวน์โหลดให้แล้ว นำไปอัปโหลดในแอป Story ได้เลย",
      );
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      console.error(e);
      toast.error("แชร์ไม่สำเร็จ — ลองดาวน์โหลดแทน");
    } finally {
      setBusy(false);
    }
  }, [capture, filename, triggerDownload]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-muted/30 p-3",
        className,
      )}
    >
      <p className="text-muted-foreground w-full text-xs sm:mr-auto sm:w-auto">
        บันทึกเป็น PNG แล้วแชร์ไป Instagram / TikTok / Facebook Stories
      </p>
      <Button
        type="button"
        variant="default"
        size="sm"
        disabled={busy}
        onClick={onShare}
      >
        <Share2 className="size-4" />
        แชร์
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={onDownload}
      >
        <Download className="size-4" />
        ดาวน์โหลด PNG
      </Button>
    </div>
  );
}
