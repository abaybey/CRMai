import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Retail Intelligence OS — Luxury Fashion Retail",
  description: "Retail Performance, DSR Analytics & Luxury Clienteling OS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#FBFBFB] text-[#1A1A1A] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
