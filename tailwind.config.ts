import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "app-bg": "#080c10",
        "panel-bg": "#0e1318",
        "card-bg": "#141b22",
        "card-hover": "#1a2330",
        "border-color": "#1f2d3d",
        "border-bright": "#2a3f57",
        "trading-green": "#00d97e",
        "trading-green-dim": "#00d97e20",
        "trading-red": "#ff4560",
        "trading-red-dim": "#ff456020",
        "trading-blue": "#3b82f6",
        "trading-yellow": "#f59e0b",
        "accent": "#6366f1",
        "accent-dim": "#6366f115",
        "primary-text": "#e2e8f0",
        "muted-text": "#64748b",
        "dim-text": "#334155",
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "ticker": "ticker 20s linear infinite",
        "glow-green": "glowGreen 2s ease-in-out infinite",
        "glow-red": "glowRed 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        glowGreen: {
          "0%,100%": { boxShadow: "0 0 6px #00d97e40" },
          "50%": { boxShadow: "0 0 16px #00d97e80" },
        },
        glowRed: {
          "0%,100%": { boxShadow: "0 0 6px #ff456040" },
          "50%": { boxShadow: "0 0 16px #ff456080" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        "card-gradient":
          "linear-gradient(135deg, #141b22 0%, #0e1318 100%)",
      },
      backgroundSize: {
        "grid-size": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
