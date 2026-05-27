"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";
import { useLanguage } from "@/lib/i18n";

export function WalletConnectCTAClient({ variant = "nav" }: { variant?: "nav" | "hero" }) {
  return (
    <WalletProviderIsland>
      <WalletConnectCTAInner variant={variant} />
    </WalletProviderIsland>
  );
}

function WalletConnectCTAInner({ variant = "nav" }: { variant?: "nav" | "hero" }) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const isHero = variant === "hero";

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={
                isHero
                  ? "w-full rounded-lg bg-arc-green px-7 py-4 text-base font-display font-bold text-arc-bg shadow-[0_0_44px_rgba(0,229,160,0.32)] transition-all hover:bg-white sm:w-auto"
                  : "rounded-lg bg-arc-green px-5 py-2.5 text-sm font-display font-bold text-arc-bg shadow-[0_0_28px_rgba(0,229,160,0.25)] transition-all hover:bg-white"
              }
            >
              {isPt ? "Conectar Carteira" : "Connect Wallet"}
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={isHero ? "btn-primary px-7 py-4 text-base" : "btn-primary px-5 py-2.5"}
            >
              {isPt ? "Trocar para Arc Testnet" : "Switch to Arc Testnet"}
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className={
              isHero
                ? "rounded-lg border border-arc-green/30 bg-arc-green/10 px-7 py-4 text-base font-display font-semibold text-arc-green transition-all hover:bg-arc-green hover:text-arc-bg"
                : "rounded-lg border border-arc-green/30 bg-arc-green/10 px-4 py-2.5 text-sm font-semibold text-arc-green transition-all hover:bg-arc-green hover:text-arc-bg"
            }
          >
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
