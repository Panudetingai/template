import type { CardBasicProps } from "@/module/stories/cards-social/aesthetic/card-basic";

const BG = "#0D0D0D";
const MUTED = "#8E8E8E";
const ACCENT = "#5674FF";
const CODE_BG = "#1A1A1A";

const defaults = {
  seriesLabel: "DAYILY WRAPPED",
  dateLabel: "",
  title: "The day I deleted a GitHub Action and slept better.",
  body: "workflow ที่เคยดูสะอาดกลายเป็นภาระ ทุกครั้งที่ต้อง release — จนกว่าจะเจอ",
  codeHighlight: "gh release create",
  quote:
    "“Native CLI ที่เข้าใจ environment ดีมักชนะ action wrapper เสมอ — เพียงแค่เข้าใจ syntax”",
  username: "@panudet",
  footerTag: "DAYILY • 2025",
  brandLine: "Made with",
};

/** JSX สำหรับ next/og (Satori) — inline styles เท่านั้น */
export function OgImageBasic(raw: Partial<CardBasicProps> = {}) {
  const seriesLabel = raw.seriesLabel ?? defaults.seriesLabel;
  const dateLabel = raw.dateLabel ?? defaults.dateLabel;
  const title = raw.title ?? defaults.title;
  const body = raw.body ?? defaults.body;
  const codeHighlight = raw.codeHighlight ?? defaults.codeHighlight;
  const quote = raw.quote ?? defaults.quote;
  const username = raw.username ?? defaults.username;
  const footerTag = raw.footerTag ?? defaults.footerTag;
  const brandLine = raw.brandLine ?? defaults.brandLine;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: BG,
        color: "#FFFFFF",
        padding: 56,
        fontFamily: "Noto Sans Thai",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <span>{seriesLabel}</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: ACCENT,
            }}
          />
          {dateLabel ? (
            <span style={{ textTransform: "none", letterSpacing: "normal" }}>
              {dateLabel}
            </span>
          ) : null}
        </div>
        <div style={{ width: 48, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginTop: 40,
          gap: 28,
          minHeight: 0,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 28, color: MUTED, lineHeight: 1.45 }}>
          {body}{" "}
          {codeHighlight ? (
            <span
              style={{
                display: "inline-block",
                marginLeft: 4,
                marginRight: 4,
                padding: "4px 12px",
                borderRadius: 8,
                fontFamily: "ui-monospace, monospace",
                fontSize: 24,
                color: "rgba(255,255,255,0.95)",
                backgroundColor: CODE_BG,
              }}
            >
              {codeHighlight}
            </span>
          ) : null}
        </div>
        {quote ? (
          <div
            style={{
              borderLeft: `4px solid ${ACCENT}`,
              paddingLeft: 20,
              fontSize: 28,
              fontStyle: "italic",
              color: MUTED,
              lineHeight: 1.5,
            }}
          >
            {quote}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 48,
          paddingTop: 32,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{username}</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            {footerTag}
          </div>
        </div>
        <div
          style={{
            fontSize: 20,
            textAlign: "right",
            lineHeight: 1.4,
            color: MUTED,
            maxWidth: 280,
          }}
        >
          {brandLine}{" "}
          <span style={{ fontWeight: 600, color: ACCENT }}>Dayily</span>
        </div>
      </div>
    </div>
  );
}
