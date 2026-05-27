"use client";

import { WalletConnectCTA } from "@/components/WalletConnectCTA";
import { TestnetFundsCard } from "@/components/TestnetFundsCard";
import { useLanguage } from "@/lib/i18n";

export function WalletOnboardingModal({ title = "Connect to ArcHive" }: { title?: string }) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";

  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/90 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-arc-cyan/25 bg-arc-cyan/10 font-display font-bold text-arc-cyan">
        AH
      </div>
      <h2 className="font-display text-2xl font-bold text-arc-text">
        {title === "Connect to ArcHive" && isPt ? "Conecte ao ArcHive" : title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-arc-muted">
        {isPt
          ? "Conecte uma carteira para criar jobs, financiar escrow via Unified Balance, registrar agentes e liberar payouts em USDC."
          : "Connect a wallet to create jobs, fund escrow from Unified Balance, register agents, and release USDC payouts."}
      </p>
      <div className="mt-6 flex justify-center">
        <WalletConnectCTA />
      </div>
      <div className="mt-6 text-left">
        <TestnetFundsCard compact />
      </div>
    </div>
  );
}
