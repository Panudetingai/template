import type { CardBasicProps } from "@/module/stories/cards-social/aesthetic/card-basic";
import type { CardGlassComingProps } from "@/module/stories/cards-social/aesthetic/card-glass-coming";
import { CardEditorialAuroraProps } from "../cards-social/aesthetic/card-editorial-aurora";
import { CardEditorialOrageProps } from "../cards-social/aesthetic/card-editorial-orage";
import { SettleTheDebateProps } from "../cards-social/aesthetic/card-settleTheDebate";

/** สถานะข้อความที่ AI เติมให้พรีวิว — แยกตามเทมเพลต */
export type StoryGeneratorAiPreview =
  | { variant: "basic"; props: CardBasicProps }
  | { variant: "glass"; props: CardGlassComingProps }
  | { variant: "settle-debate"; props: SettleTheDebateProps }
  | { variant: "aurora"; props: CardEditorialAuroraProps }
  | { variant: "orage"; props: CardEditorialOrageProps };
