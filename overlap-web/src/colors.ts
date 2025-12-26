// colors.ts
export const colors = {
  white: "#FFFFFF",

  gray: {
    50:  "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    700: "#374151",
    900: "#111827",
  },

  green: {
    50:  "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E", // primary
    600: "#16A34A",
  },
};

export const buttonPrimary =
  "inline-flex items-center justify-center \
  rounded-sm px-2 py-1 text-sm font-medium \
  bg-[#4CAF50]/80 text-black border-[1px] border-[#4CAF50] \
  hover:bg-[#4CAF50]/90 hover:border-black \
  active:scale-[0.98] \
  transition";

export const buttonSecondary =
  "inline-flex items-center justify-center \
  rounded-sm px-2 py-1 text-sm font-medium \
  bg-white border border-gray-200 text-gray-700 \
  hover:bg-gray-50 hover:border-black \
  transition";

export const buttonGlass =
  "inline-flex items-center justify-center \
  rounded-sm px-2 py-1 text-sm font-medium \
  bg-white/60 backdrop-blur-md \
  border border-white/70 \
  text-gray-800 \
  shadow-soft \
  hover:bg-white/80 hover:border-black \
  transition";







