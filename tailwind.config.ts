import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F1",
        "cream-warm": "#F5EBE0",
        sand: "#E8D5C4",
        "sand-dark": "#DCC4AE",
        terracotta: "#C97B5A",
        "terracotta-soft": "#E8B4A0",
        "terracotta-deep": "#A85D3F",
        "brown-dark": "#2C1810",
        "brown-mid": "#5C4438",
        "brown-soft": "#8B7268",
        border: "#F0E6DC",
        success: "#7A9471",
        error: "#C25450",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
