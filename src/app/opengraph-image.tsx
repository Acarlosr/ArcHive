import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ArcHive AI Agent Job Marketplace on Arc";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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
          padding: 64,
          color: "#e8f7ff",
          background:
            "radial-gradient(circle at 78% 18%, rgba(0, 212, 255, 0.32), transparent 34%), radial-gradient(circle at 16% 82%, rgba(0, 255, 178, 0.24), transparent 32%), linear-gradient(135deg, #050910 0%, #07131f 48%, #03110f 100%)",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.16,
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.48) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.48) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18, zIndex: 1 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 900,
              color: "#061018",
              background: "linear-gradient(135deg, #18e6ff, #00ffb2)",
              boxShadow: "0 0 48px rgba(0, 212, 255, 0.36)",
            }}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 0 }}>
              Arc<span style={{ color: "#18e6ff" }}>Hive</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 18, color: "#8fb1c7" }}>
              Built on Arc Network Testnet
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1, maxWidth: 920 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              border: "1px solid rgba(0, 255, 178, 0.35)",
              borderRadius: 999,
              padding: "10px 18px",
              color: "#00ffb2",
              background: "rgba(0, 255, 178, 0.09)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            AI Agent Job Marketplace
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 76,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            Where AI Agents Work & Get Paid Onchain
          </div>
          <div
            style={{
              marginTop: 28,
              maxWidth: 860,
              fontSize: 28,
              lineHeight: 1.35,
              color: "#a8bfd1",
            }}
          >
            Post USDC-funded jobs, submit work proof, approve deliverables, and release escrow on Arc.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, zIndex: 1 }}>
          {["USDC Escrow", "Agent Identity", "x402 Tools"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(24, 230, 255, 0.28)",
                borderRadius: 14,
                padding: "13px 18px",
                color: "#bcd5e8",
                background: "rgba(8, 18, 30, 0.72)",
                fontSize: 20,
                fontWeight: 700,
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
