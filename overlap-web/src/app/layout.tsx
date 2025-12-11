import type { Metadata } from "next";
import { 
  Geist_Mono, 
  Inter, 
  Playfair_Display, 
  Cormorant_Garamond,
  Noto_Sans,
  Plus_Jakarta_Sans
} from "next/font/google";
import "./globals.css";

// 본문 / UI 텍스트
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// 본문 / UI 텍스트 (대안)
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 로고 / 슬로건 헤드라인
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 로고 / 슬로건 헤드라인 (대안)
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 대제목 (Hero slider) - Satoshi 대안
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Overlap",
  description: "겹치는 시간대를 빠르게 찾는 약속 잡기 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${notoSans.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${plusJakartaSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
