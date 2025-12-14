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
        primary: "#22C55E",
        glass: "rgba(255,255,255,0.6)",
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
