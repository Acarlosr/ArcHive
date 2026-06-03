"use client";
// src/components/Navbar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { WalletConnectCTA } from "@/components/WalletConnectCTA";
import { useLanguage } from "@/lib/i18n";

const NAV_LINKS = [
  { href: "/jobs", labelKey: "nav.jobs" },
  { href: "/agents", labelKey: "nav.agents" },
  { href: "/tools", labelKey: "nav.spend" },
  { href: "/proof", labelKey: "nav.proof" },
  { href: "/guide", labelKey: "nav.guide" },
  { href: "/dashboard", labelKey: "nav.dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-arc-border/60 bg-arc-bg/78 shadow-[0_1px_0_rgba(255,255,255,0.03),0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-arc-cyan/30 bg-[radial-gradient(circle_at_32%_24%,rgba(45,243,208,0.24),transparent_34%),radial-gradient(circle_at_78%_78%,rgba(216,185,106,0.18),transparent_42%),linear-gradient(145deg,rgba(5,9,8,0.98),rgba(16,22,20,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_24px_rgba(45,243,208,0.10)] transition-all duration-300 group-hover:border-arc-cyan/60 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_34px_rgba(45,243,208,0.22)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 48 48"
                className="h-8 w-8 overflow-visible"
                fill="none"
              >
                <path
                  d="M24 4.5 40.9 14.2v19.6L24 43.5 7.1 33.8V14.2L24 4.5Z"
                  stroke="url(#archive-logo-hex)"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_8px_rgba(45,243,208,0.22)]"
                />
                <path
                  d="M13.2 29.2c2.9-8.5 9.4-14.4 18.9-15.7"
                  stroke="url(#archive-logo-arc)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
                <path
                  d="M16.6 34.4 24 15.8l7.4 18.6"
                  stroke="#EEFDF9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.4 27.6h7.2"
                  stroke="#EEFDF9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="24" r="3" fill="#2DF3D0" />
                <circle cx="34.4" cy="13.8" r="2.4" fill="#D8B96A" />
                <circle cx="13.9" cy="31.6" r="1.8" fill="#E36F9F" />
                <path
                  d="M24 24 34.4 13.8M24 24 13.9 31.6"
                  stroke="rgba(45,243,208,0.42)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="archive-logo-hex" x1="6" y1="7" x2="42" y2="41">
                    <stop stopColor="#2DF3D0" />
                    <stop offset="0.54" stopColor="#5DFFC0" />
                    <stop offset="1" stopColor="#D8B96A" />
                  </linearGradient>
                  <linearGradient id="archive-logo-arc" x1="13" y1="27" x2="33" y2="12">
                    <stop stopColor="#D8B96A" />
                    <stop offset="1" stopColor="#2DF3D0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-display text-lg font-extrabold tracking-normal text-arc-text">
              Arc<span className="bg-gradient-to-r from-arc-cyan via-arc-green to-arc-gold bg-clip-text text-transparent">Hive</span>
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
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/jobs/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 border border-arc-border text-arc-muted text-sm font-medium rounded-lg hover:border-arc-cyan/40 hover:text-arc-cyan transition-all"
            >
              <span>+</span> {t("nav.postJob")}
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
              {t(link.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
