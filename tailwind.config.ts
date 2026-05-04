import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        arc: {
          bg: "#060a10",
          surface: "#0c1219",
          card: "#111822",
          border: "#1a2535",
          "border-hover": "#243346",
          cyan: "#00d4ff",
          green: "#00e5a0",
          purple: "#a855f7",
          red: "#ff4d6a",
          orange: "#ff9f43",
          text: "#e8f0f8",
          muted: "#8fa8c0",
          dim: "#4d6a85",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui"],
        body: ["var(--font-body)", "system-ui"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "scale-pop": "scalePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.1)" },
          "100%": { boxShadow: "0 0 40px rgba(0, 212, 255, 0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scalePop: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
