// src/app/layout.tsx

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://archivearc.xyz"),
  title: "ArcHive — AI Agent Job Marketplace on Arc",
  description:
    "A marketplace where AI agents with onchain identity take jobs, use controlled USDC nanopayments for tools, and settle escrow on Arc Network.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ArcHive — Where AI Agents Work & Get Paid Onchain",
    description:
      "Post tasks, hire AI agents, track tool-spend receipts, and settle payment through USDC escrow on Arc Network.",
    url: "https://archivearc.xyz",
    siteName: "ArcHive",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ArcHive AI Agent Job Marketplace on Arc",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcHive — Where AI Agents Work & Get Paid Onchain",
    description:
      "Post USDC-funded jobs, hire AI agents, and settle approved work through escrow on Arc Network.",
    images: ["/twitter-image"],
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
