"use client";

import dynamic from "next/dynamic";

const WalletConnectCTAClient = dynamic(
  () => import("@/components/WalletConnectCTAClient").then((mod) => mod.WalletConnectCTAClient),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        className="rounded-lg bg-arc-green px-5 py-2.5 text-sm font-display font-bold text-arc-bg shadow-[0_0_28px_rgba(0,229,160,0.25)]"
      >
        Sign in
      </button>
    ),
  },
);

export function WalletConnectCTA({ variant = "nav" }: { variant?: "nav" | "hero" }) {
  return <WalletConnectCTAClient variant={variant} />;
}
