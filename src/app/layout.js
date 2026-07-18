import { Noto_Sans_SC, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
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

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${outfit.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
