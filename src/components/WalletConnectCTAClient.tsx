"use client";
// src/components/WalletConnectCTAClient.tsx
//
// Single CTA for auth. With Dynamic configured, "Sign in" opens the
// Dynamic auth flow (email, social, passkey, or external wallet) and the
// embedded wallet is created behind the scenes. Without Dynamic (demo
// mode), falls back to connecting an injected wallet via wagmi.

import { useDynamicContext, DynamicUserProfile } from "@dynamic-labs/sdk-react-core";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";
import { hasDynamicAuth, arcTestnet } from "@/components/Providers";
import { useLanguage } from "@/lib/i18n";

type Variant = "nav" | "hero";

const styles = {
  primary: (isHero: boolean) =>
    isHero
      ? "w-full rounded-lg bg-arc-green px-7 py-4 text-base font-display font-bold text-arc-bg shadow-[0_0_44px_rgba(0,229,160,0.32)] transition-all hover:bg-white sm:w-auto"
      : "rounded-lg bg-arc-green px-5 py-2.5 text-sm font-display font-bold text-arc-bg shadow-[0_0_28px_rgba(0,229,160,0.25)] transition-all hover:bg-white",
  connected: (isHero: boolean) =>
    isHero
      ? "rounded-lg border border-arc-green/30 bg-arc-green/10 px-7 py-4 text-base font-display font-semibold text-arc-green transition-all hover:bg-arc-green hover:text-arc-bg"
      : "rounded-lg border border-arc-green/30 bg-arc-green/10 px-4 py-2.5 text-sm font-semibold text-arc-green transition-all hover:bg-arc-green hover:text-arc-bg",
  switch: (isHero: boolean) =>
    isHero ? "btn-primary px-7 py-4 text-base" : "btn-primary px-5 py-2.5",
};

const shortAddress = (addr?: string) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

export function WalletConnectCTAClient({ variant = "nav" }: { variant?: Variant }) {
  return (
    <WalletProviderIsland>
      {hasDynamicAuth ? (
        <DynamicCTA variant={variant} />
      ) : (
        <FallbackCTA variant={variant} />
      )}
    </WalletProviderIsland>
  );
}

/** Dynamic-powered CTA: email/social/passkey/wallet sign-in. */
function DynamicCTA({ variant }: { variant: Variant }) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const isHero = variant === "hero";

  const { setShowAuthFlow, setShowDynamicUserProfile, sdkHasLoaded } =
    useDynamicContext();
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (!sdkHasLoaded || !isConnected) {
    return (
      <button
        type="button"
        disabled={!sdkHasLoaded}
        onClick={() => setShowAuthFlow(true)}
        className={styles.primary(isHero)}
      >
        {isPt ? "Entrar" : "Sign in"}
      </button>
    );
  }

  if (chain?.id !== arcTestnet.id) {
    return (
      <button
        type="button"
        disabled={isSwitching}
        onClick={() => switchChain({ chainId: arcTestnet.id })}
        className={styles.switch(isHero)}
      >
        {isPt ? "Trocar para Arc Testnet" : "Switch to Arc Testnet"}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDynamicUserProfile(true)}
        className={styles.connected(isHero)}
      >
        {shortAddress(address)}
      </button>
      <DynamicUserProfile />
    </>
  );
}

/** Demo-mode CTA: injected wallet only (no Dynamic env configured). */
function FallbackCTA({ variant }: { variant: Variant }) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const isHero = variant === "hero";

  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (!isConnected) {
    return (
      <button
        type="button"
        disabled={isPending || connectors.length === 0}
        onClick={() => connectors[0] && connect({ connector: connectors[0] })}
        className={styles.primary(isHero)}
      >
        {isPt ? "Conectar Carteira" : "Connect Wallet"}
      </button>
    );
  }

  if (chain?.id !== arcTestnet.id) {
    return (
      <button
        type="button"
        disabled={isSwitching}
        onClick={() => switchChain({ chainId: arcTestnet.id })}
        className={styles.switch(isHero)}
      >
        {isPt ? "Trocar para Arc Testnet" : "Switch to Arc Testnet"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => disconnect()}
      title={isPt ? "Clique para desconectar" : "Click to disconnect"}
      className={styles.connected(isHero)}
    >
      {shortAddress(address)}
    </button>
  );
}
