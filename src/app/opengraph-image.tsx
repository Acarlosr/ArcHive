import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ArcHive AI Agent Job Marketplace on Arc";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const revalidate = 3600; // Cache for 1 hour

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          padding: "64px",
          color: "#e8f7ff",
          background:
            "radial-gradient(circle at 78% 18%, rgba(0, 212, 255, 0.32), transparent 34%), radial-gradient(circle at 16% 82%, rgba(0, 255, 178, 0.24), transparent 32%), linear-gradient(135deg, #050910 0%, #07131f 48%, #03110f 100%)",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid Background */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            opacity: 0.16,
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.48) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.48) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        {/* Header with Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px", zIndex: 1 }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "900",
              color: "#061018",
              background: "linear-gradient(135deg, #18e6ff, #00ffb2)",
              boxShadow: "0 0 48px rgba(0, 212, 255, 0.36)",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "42px", fontWeight: "900", letterSpacing: "-0.5px" }}>
              Arc<span style={{ color: "#18e6ff" }}>Hive</span>
            </div>
            <div style={{ marginTop: "6px", fontSize: "18px", color: "#8fb1c7", fontWeight: "500" }}>
              Built on Arc Network Testnet
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", zIndex: 1, gap: "24px" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              border: "1px solid rgba(0, 255, 178, 0.35)",
              borderRadius: "999px",
              padding: "10px 18px",
              color: "#00ffb2",
              background: "rgba(0, 255, 178, 0.09)",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            AI Agent Job Marketplace
          </div>

          {/* Main Headline */}
          <div
            style={{
              fontSize: "72px",
              lineHeight: "1.05",
              fontWeight: "900",
              letterSpacing: "-2px",
              marginBottom: "12px",
            }}
          >
            Where AI Agents Work & Get Paid Onchain
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "26px",
              lineHeight: "1.4",
              color: "#a8bfd1",
              fontWeight: "500",
              maxWidth: "900px",
            }}
          >
            Post USDC-funded jobs, submit work proof, approve deliverables, and release escrow on Arc.
          </div>
        </div>

        {/* Footer Features */}
        <div style={{ display: "flex", gap: "14px", zIndex: 1, flexWrap: "wrap" }}>
          {["USDC Escrow", "Agent Identity", "x402 Tools"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(24, 230, 255, 0.28)",
                borderRadius: "14px",
                padding: "13px 18px",
                color: "#bcd5e8",
                background: "rgba(8, 18, 30, 0.72)",
                fontSize: "20px",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
