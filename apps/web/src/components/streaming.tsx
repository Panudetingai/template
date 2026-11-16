"use client";

import { cn } from "@/lib/utils";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { ClassValue } from "clsx";
import { Sarabun } from "next/font/google";
import { AnimateOptions, Streamdown } from "streamdown";

const sarabun = Sarabun({
  subsets: ["thai"],
  weight: ["400", "500", "700"],
});

interface StreamingResponseProps {
  useAnimation?: boolean;
  className?: ClassValue;
  textStream: string;
  isAnimating?: boolean;
  animationOption?: AnimateOptions;
  mode?: "streaming" | "static";
  caret?: "block" | "circle";
}

export default function StreamingResponse({
  className,
  useAnimation = false,
  textStream,
  isAnimating,
  animationOption,
  mode = "streaming",
  caret = "circle",
}: StreamingResponseProps) {
  const animated = useAnimation ? {
    animation: animationOption?.animation || "blurIn",
    duration: animationOption?.duration || 200,
    easing: animationOption?.easing || "ease",
    sep: animationOption?.sep || "word",
  } : false;
  return (
    <Streamdown
      caret={caret}
      animated={animated}
      mode={mode}
      isAnimating={isAnimating}
      plugins={{ cjk, code, mermaid, math }}
      className={cn(className, sarabun.className)}
    >
      {textStream}
    </Streamdown>
  );
}