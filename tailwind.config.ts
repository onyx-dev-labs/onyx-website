import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#050b1a", // Deep Interface
          950: "#020617", // Void Background
        },
        cyan: {
          500: "#06b6d4", // Electric Cyan
          900: "#164e63", // Dark Cyan
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, rgba(6,182,212,0.1) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;