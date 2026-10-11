import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f2efe9",
          color: "#1a1814",
          border: "8px solid #1a1814",
          padding: "64px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          BLD / Pairs
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          <div>Train all</div>
          <div>552 pairs.</div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.6 }}>
          Speffz A–X · presets + your own words
        </div>
      </div>
    ),
    { ...size },
  );
}
