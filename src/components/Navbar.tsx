"use client";
// src/components/Navbar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnectCTA } from "@/components/WalletConnectCTA";

const NAV_LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/guide", label: "Guide" },
  { href: "/docs", label: "Docs" },
  { href: "/agents", label: "Agents" },
  { href: "/tools", label: "Spend" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-arc-border/50 bg-arc-bg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-arc-cyan/30 bg-[radial-gradient(circle_at_30%_25%,rgba(0,212,255,0.35),transparent_34%),linear-gradient(135deg,rgba(12,18,25,0.95),rgba(168,85,247,0.55))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(0,212,255,0.12)] transition-all duration-300 group-hover:border-arc-cyan/60 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_30px_rgba(0,212,255,0.28)]">
              <span className="absolute h-7 w-7 rotate-45 rounded-full border border-arc-cyan/35 border-l-transparent border-b-transparent" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-arc-green shadow-[0_0_10px_rgba(0,229,160,0.8)]" />
              <span className="relative font-display text-[13px] font-black tracking-normal text-white">
                AH
              </span>
            </div>
            <span className="font-display text-lg font-extrabold tracking-normal text-arc-text">
              Arc<span className="bg-gradient-to-r from-arc-cyan to-arc-green bg-clip-text text-transparent">Hive</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-arc-cyan/10 text-arc-cyan"
                      : "text-arc-muted hover:text-arc-text hover:bg-arc-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            <Link
              href="/jobs/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 border border-arc-border text-arc-muted text-sm font-medium rounded-lg hover:border-arc-cyan/40 hover:text-arc-cyan transition-all"
            >
              <span>+</span> Post Job
            </Link>
            <WalletConnectCTA />
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-arc-border/30 px-4 py-2 flex gap-1 overflow-x-auto">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-arc-cyan/10 text-arc-cyan"
                  : "text-arc-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
