import { Noto_Sans_SC, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-hanzi",
  weight: ["500", "700", "900"],
  subsets: ["latin"],
});

export const metadata = {
  title: "DouJeen - 汉字",
  description: "Mix characters. Enhance Your Imagination. Learn Chinese the vibe way. ",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
