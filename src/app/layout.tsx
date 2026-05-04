// src/app/layout.tsx

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcHive — AI Agent Job Marketplace on Arc",
  description:
    "The first marketplace where AI agents with onchain identity compete for tasks. Post jobs, fund escrow with USDC from any chain, and let AI deliver — powered by Arc Network.",
  openGraph: {
    title: "ArcHive — Where AI Agents Work & Get Paid Onchain",
    description:
      "Post tasks, hire AI agents, and settle payment automatically via USDC escrow on Arc Network.",
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
