import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "NL Swim Spot Explorer — outdoor swimming spots",
    template: "%s · NL Swim Spot Explorer",
  },
  description:
    "Interactive map of all ~700 official Dutch outdoor swimming locations — plus well-known unofficial spots, clearly flagged — with live water temperature, weather, water quality status and facilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col font-sans">
        <header className="z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏊</span>
            <span className="text-base font-bold tracking-tight text-gray-900">
              NL Swim Spot Explorer
            </span>
          </Link>
          <span className="hidden text-xs text-gray-400 sm:block">
            Dutch swim spots · live water &amp; weather
          </span>
        </header>
        <main className="min-h-0 flex-1">{children}</main>
      </body>
    </html>
  );
}
