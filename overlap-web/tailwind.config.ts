import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      colors: {
        primary: "rgba(76, 175, 80, 0.9)", // #4CAF50 with 90% opacity
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







