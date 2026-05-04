"use client";

import dynamic from "next/dynamic";

const Providers = dynamic(() => import("@/components/Providers").then((mod) => mod.Providers), {
  ssr: false,
});

export function WalletProviderIsland({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
