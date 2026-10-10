"use client";
// src/components/Providers.tsx
//
// Wallet + auth providers for ArcHive.
// Dynamic (dynamic.xyz) provides email/social/passkey login with a
// non-custodial embedded MPC wallet, plus external wallet connect.
// DynamicWagmiConnector syncs the Dynamic session into wagmi, so every
// existing wagmi hook (useAccount, useWalletClient, ...) keeps working.
//
// Demo mode: if NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is missing, we fall
// back to a plain wagmi provider (injected wallet only) so the app still
// builds and runs.

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  baseSepolia,
  arbitrumSepolia,
  sepolia,
  mainnet,
  base,
  arbitrum,
} from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { arcTransport, ARC_RPC_URLS } from "@/lib/arc/rpc";
import { arcChain, ARC_NETWORK } from "@/lib/arc/network";

// Dynamic forbids more than one DynamicContextProvider in the tree. The app
// wraps many wallet-touching components in their own <Providers> island, so we
// make Providers re-entrant: the outermost mount sets up the full stack and
// flags the context; any nested Providers becomes a transparent passthrough.
const WalletProvidersMountedContext = createContext(false);

const DYNAMIC_ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;
export const hasDynamicAuth = Boolean(DYNAMIC_ENV_ID);

// Funding-source chains mirror the Arc App Kit mapping: mainnet chains on
// mainnet, Sepolia variants on testnet.
const fundingChains = ARC_NETWORK === "mainnet"
  ? [mainnet, base, arbitrum]
  : [baseSepolia, arbitrumSepolia, sepolia];

// The Arc network as a Dynamic custom EVM network (mirrors `arcChain`).
const dynamicEvmNetworks = [
  {
    blockExplorerUrls: [arcChain.blockExplorers?.default.url ?? "https://explorer.arc.io"],
    chainId: arcChain.id,
    chainName: arcChain.name,
    iconUrls: ["https://archivearc.xyz/icon.png"],
    name: arcChain.name,
    nativeCurrency: arcChain.nativeCurrency,
    networkId: arcChain.id,
    rpcUrls: ARC_RPC_URLS,
    vanityName: arcChain.name,
  },
];

const wagmiConfig = createConfig({
  chains: [arcChain, ...fundingChains],
  // Dynamic implements multi-injected provider discovery itself.
  multiInjectedProviderDiscovery: !hasDynamicAuth,
  connectors: hasDynamicAuth ? [] : [injected()],
  transports: {
    [arcChain.id]: arcTransport(),
    ...Object.fromEntries(fundingChains.map((chain) => [chain.id, http()])),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const alreadyMounted = useContext(WalletProvidersMountedContext);
  // A parent <Providers> is already in the tree: don't nest a second stack.
  if (alreadyMounted) return <>{children}</>;

  // Demo / fallback mode: plain wagmi (injected wallet only).
  if (!hasDynamicAuth) {
    return (
      <WalletProvidersMountedContext.Provider value={true}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
      </WalletProvidersMountedContext.Provider>
    );
  }

  return (
    <WalletProvidersMountedContext.Provider value={true}>
      <DynamicContextProvider
        theme="dark"
        settings={{
          environmentId: DYNAMIC_ENV_ID as string,
          walletConnectors: [EthereumWalletConnectors],
          overrides: { evmNetworks: dynamicEvmNetworks },
          // Email-first onboarding; external wallets stay available as an option.
          initialAuthenticationMode: "connect-and-sign",
          appName: "ArcHive",
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </WalletProvidersMountedContext.Provider>
  );
}
