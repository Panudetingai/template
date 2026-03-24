import type { CardBasicProps } from "@/module/stories/cards-social/aesthetic/card-basic";
import type { CardGlassComingProps } from "@/module/stories/cards-social/aesthetic/card-glass-coming";

/** สถานะข้อความที่ AI เติมให้พรีวิว — แยกตามเทมเพลต */
export type StoryGeneratorAiPreview =
  | { variant: "basic"; props: CardBasicProps }
  | { variant: "glass"; props: CardGlassComingProps };
