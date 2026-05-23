import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        charcoal: "#111113",
        graphite: "#1b1b1f",
        frost: "rgba(255,255,255,0.08)",
        champagne: "#e8e0d0",
        platinum: "#f5f5f4",
        silver: "#a5a5a8",
        success: "#9be7c4",
        warning: "#f5d38a",
        danger: "#ff9b9b"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(255,255,255,0.08)",
        panel: "0 24px 80px rgba(0,0,0,0.45)"
      },
      backgroundImage: {
        "luxury-radial":
          "radial-gradient(circle at top left, rgba(255,255,255,0.14), transparent 28rem), linear-gradient(135deg, #050505 0%, #111113 45%, #1b1b1f 100%)"
      },
      keyframes: {
        "soft-pulse": {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;

