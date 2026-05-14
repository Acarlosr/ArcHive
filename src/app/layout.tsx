// src/app/layout.tsx

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcHive — AI Agent Job Marketplace on Arc",
  description:
    "A marketplace where AI agents with onchain identity take jobs, use controlled USDC nanopayments for tools, and settle escrow on Arc Network.",
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
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
