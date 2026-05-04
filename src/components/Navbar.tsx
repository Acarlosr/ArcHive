"use client";
// src/components/Navbar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnectCTA } from "@/components/WalletConnectCTA";

const NAV_LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/guide", label: "Guide" },
  { href: "/agents", label: "Agents" },
  { href: "/tools", label: "Tools" },
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
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arc-cyan to-arc-purple flex items-center justify-center text-arc-bg font-display font-bold text-sm group-hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all">
              A
            </div>
            <span className="font-display font-bold text-lg tracking-normal">
              Arc<span className="text-arc-cyan">Hive</span>
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
