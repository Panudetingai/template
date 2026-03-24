import type { CardGlassComingProps } from "@/module/stories/cards-social/aesthetic/card-glass-coming";

const BG = "#1a1a1a";
const MUTED = "rgba(255,255,255,0.55)";

/** โหมด OG ไม่มี backdrop-blur — ใช้แผ่นทึบแทน */
export function OgImageGlass(raw: Partial<CardGlassComingProps> = {}) {
  const line1 = raw.line1 ?? "COM";
  const line2 = raw.line2 ?? "ING";
  const line3 = raw.line3 ?? "SOON";
  const topRight =
    raw.topRight ?? "VISUAL & GRAPHIC EXPLORATION · NOV 17 2025";
  const bottomLeft = raw.bottomLeft ?? "ISBN 0011-172025\nEST 1994";
  const bottomCenter =
    raw.bottomCenter ??
    "DESIGN PORTFOLIO DAYILY — CREATIVE\nPORTFOLIO COMING SOON";
  const bottomRight = raw.bottomRight ?? "DAYILY • 2025";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: BG,
        color: "#fff",
        position: "relative",
        fontFamily: "Noto Sans Thai",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 36,
          maxWidth: "48%",
          fontSize: 20,
          textAlign: "right",
          lineHeight: 1.35,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        {topRight}
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8% 4%",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 0.92,
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          <div>{line1}</div>
          <div>{line2}</div>
          <div>{line3}</div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "4%",
          maxWidth: "42%",
          fontSize: 20,
          lineHeight: 1.35,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: MUTED,
          whiteSpace: "pre-line",
        }}
      >
        {bottomLeft}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "90%",
          fontSize: 18,
          textAlign: "center",
          lineHeight: 1.35,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: MUTED,
          whiteSpace: "pre-line",
        }}
      >
        {bottomCenter}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "6%",
          right: "4%",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        {bottomRight}
      </div>
    </div>
  );
}
