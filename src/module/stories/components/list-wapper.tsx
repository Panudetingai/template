"use client";

import { CardBasic } from "@/module/stories/cards-social/aesthetic/card-basic";
import { CardEditorialAurora } from "@/module/stories/cards-social/aesthetic/card-editorial-aurora";
import { CardGlassComing } from "@/module/stories/cards-social/aesthetic/card-glass-coming";
import { motion } from "framer-motion";
import { useRef } from "react";
import BarcelonaMultilingual from "../cards-social/aesthetic/card-darcelonaMultilingual";
import { CardEditorialOrage } from "../cards-social/aesthetic/card-editorial-orage";
import { SettleTheDebate } from "../cards-social/aesthetic/card-settleTheDebate";
import {
  STORY_CANVAS_PRESETS,
  StoryCanvasPreset,
} from "./socials/story-canvas-presets";
import { StoryShareActions } from "./socials/story-share-actions";
import { StorySocialCard } from "./socials/story-social-card";

export const StorySocialCardList = {
  storys: [
    {
      preset: "story",
      Card: CardBasic,
      filename: "dayily-wrapped.png",
      captureBackgroundColor: "#0d0d0d",
    },
    {
      preset: "story",
      Card: CardGlassComing,
      filename: "dayily-glass.png",
      captureBackgroundColor: "#1a1a1a",
    },
    {
      preset: "story",
      Card: CardEditorialAurora,
      filename: "dayily-editorial.png",
      captureBackgroundColor: "#f4f4f2",
    },
    {
      preset: "story",
      Card: CardEditorialOrage,
      filename: "dayily-editorial-orage.png",
      captureBackgroundColor: "#f4f4f2",
    },
    {
      preset: "story",
      Card: SettleTheDebate,
      filename: "dayily-settle-the-debate.png",
      captureBackgroundColor: "#ffffff",
    },
    {
      preset: "story",
      Card: BarcelonaMultilingual,
      filename: "dayily-barcelona-multilingual.png",
      captureBackgroundColor: "#e5e5e5",
    },
  ],
  og: [
    {
      preset: "og",
      Card: CardBasic,
      filename: "dayily-og-wrapped.png",
      captureBackgroundColor: "#0d0d0d",
    },
    {
      preset: "og",
      Card: CardGlassComing,
      filename: "dayily-og-glass.png",
      captureBackgroundColor: "#1a1a1a",
    },
    {
      preset: "og",
    },
    {
      preset: "og",
      Card: SettleTheDebate,
      filename: "dayily-og-settle-the-debate.png",
      captureBackgroundColor: "#ffffff",
    },
  ],
  square: [
    {
      preset: "square",
      Card: CardEditorialAurora,
      filename: "dayily-square.png",
      captureBackgroundColor: "#f4f4f2",
    },
  ],
};

export default function ListWapper() {
  const exportRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col gap-12 mt-4 border-t pt-4">
      <section className="space-y-6">
        <h2 className="text-foreground text-sm font-semibold">
          Story 9:16 — Multiple Templates (adjust to screen width)
        </h2>
        <div className="grid grid-cols-1 gap-8 min-[1100px]:grid-cols-2 min-[1600px]:grid-cols-3">
          {StorySocialCardList.storys.map((item, index) => (
            <motion.div
              key={index}
              className="space-y-3"
              whileHover={{ y: -10, transition: { duration: 0.5 } }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StorySocialCard
                ref={exportRef as React.RefObject<HTMLDivElement>}
                preset={item.preset as StoryCanvasPreset}
                Card={item.Card}
                filename={item.filename}
                captureBackgroundColor={item.captureBackgroundColor}
              />
              <StoryShareActions
                exportRef={exportRef}
                filename={item.filename}
                targetWidth={
                  STORY_CANVAS_PRESETS[item.preset as StoryCanvasPreset]
                    .exportWidth
                }
                backgroundColor={item.captureBackgroundColor}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* <section className="space-y-3">
        <h2 className="text-foreground text-sm font-semibold">
          OG 1200×630 — เหมาะกับลิงก์พรีวิว
        </h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <StorySocialCard
            preset="og"
            Card={CardBasic}
            filename="dayily-og-wrapped.png"
            captureBackgroundColor="#0d0d0d"
          />
          <StorySocialCard
            preset="og"
            Card={CardGlassComing}
            filename="dayily-og-glass.png"
            captureBackgroundColor="#1a1a1a"
          />
          <StorySocialCard
            preset="og"
            Card={SettleTheDebate}
            filename="dayily-og-settle-the-debate.png"
            captureBackgroundColor="#ffffff"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-foreground text-sm font-semibold">
          Square 1:1 — โพสต์ฟีด / โปรไฟล์
        </h2>
        <div className="mx-auto max-w-md">
          <StorySocialCard
            preset="square"
            Card={CardEditorialAurora}
            filename="dayily-square.png"
            captureBackgroundColor="#f4f4f2"
          />
        </div>
      </section> */}
    </div>
  );
}
