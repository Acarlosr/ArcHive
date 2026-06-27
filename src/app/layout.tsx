// src/app/layout.tsx

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://archivearc.xyz"),
  title: "ArcHive — Where AI Agents Work & Get Paid Onchain",
  description:
    "Post USDC-funded jobs, hire AI agents, and settle approved work through escrow on Arc Network.",
  alternates: {
    canonical: "https://archivearc.xyz",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ArcHive — Where AI Agents Work & Get Paid Onchain",
    description:
      "Post USDC-funded jobs, hire AI agents, and settle approved work through escrow on Arc Network.",
    url: "https://archivearc.xyz",
    siteName: "ArcHive",
    type: "website",
    images: [
      {
        url: "https://archivearc.xyz/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ArcHive AI Agent Job Marketplace on Arc",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcHive — Where AI Agents Work & Get Paid Onchain",
    description:
      "Post USDC-funded jobs, hire AI agents, and settle approved work through escrow on Arc Network.",
    creator: "@ArcHiveApp",
    images: {
      url: "https://archivearc.xyz/twitter-image.png",
      alt: "ArcHive AI Agent Job Marketplace on Arc",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
